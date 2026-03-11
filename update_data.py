import os
import requests
import json
import math
import time
from datetime import datetime, timedelta
from supabase import create_client, Client

# ==========================================
# 1. 初始化环境变量与容灾报警配置
# ==========================================
def clean_secret(val):
    if not val:
        return val
    val = str(val).strip()
    if "](" in val:
        val = val.split("](")[1].strip(")")
    return val

SUPABASE_URL = clean_secret(os.environ.get("SUPABASE_URL"))
SUPABASE_KEY = clean_secret(os.environ.get("SUPABASE_KEY"))
DEEPSEEK_KEY = clean_secret(os.environ.get("DEEPSEEK_KEY"))
MARKETDATA_TOKEN = clean_secret(os.environ.get("MARKETDATA_TOKEN"))
BARK_KEY = clean_secret(os.environ.get("BARK_KEY")) 

def send_alert(title, message):
    if BARK_KEY:
        try:
            requests.get(f"https://api.day.app/{BARK_KEY}/{title}/{message}", timeout=5)
        except Exception as e:
            print(f"警报推送失败: {e}")

if SUPABASE_URL and not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# 2. SEC 真实财务数据抓取与降级防线 (增强版)
# ==========================================
SEC_HEADERS = {"User-Agent": "BioQuantix Founder contact@bioquantix.com"}
CIK_DICT = {}

try:
    print("📥 正在拉取 SEC Ticker-CIK 字典存入内存...")
    sec_resp = requests.get("https://www.sec.gov/files/company_tickers.json", headers=SEC_HEADERS, timeout=10)
    sec_resp.raise_for_status()
    sec_dict_raw = sec_resp.json()
    CIK_DICT = {item['ticker']: str(item['cik_str']).zfill(10) for item in sec_dict_raw.values()}
    print("✅ SEC 字典加载成功！")
except Exception as e:
    print(f"❌ SEC 字典拉取失败: {e}")
    send_alert("系统警告", "SEC字典拉取失败，财务抓取将全面降级。")

def fetch_sec_financials(ticker):
    """提取真实SEC财报，支持多种会计标签，并包含防崩溃降级"""
    cik = CIK_DICT.get(ticker)
    if not cik:
        return None, 'CIK_NOT_FOUND_IN_SEC_DICT' # 内部详细报错，返回 None 交给主循环查历史
    
    try:
        url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
        
        # 加上 time.sleep 防止被 SEC 封禁 IP (每次请求停顿 0.2 秒)
        time.sleep(0.2) 
        
        resp = requests.get(url, headers=SEC_HEADERS, timeout=10)
        if resp.status_code != 200:
            return None, f'HTTP_{resp.status_code}_FROM_SEC'
            
        facts = resp.json().get('facts', {}).get('us-gaap', {})
        
        # 1. 扩充“现金”的抓取词库
        cash_data = None
        for cash_tag in ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'CashAndCashEquivalentsAtCarryingValueIncludingDiscontinuedOperations']:
            if cash_tag in facts:
                cash_data = facts[cash_tag].get('units', {}).get('USD', [])
                if cash_data: break
                
        # 2. 扩充“研发费用”的抓取词库
        rnd_data = None
        for rnd_tag in ['ResearchAndDevelopmentExpense', 'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost']:
            if rnd_tag in facts:
                rnd_data = facts[rnd_tag].get('units', {}).get('USD', [])
                if rnd_data: break
        
        if not cash_data or not rnd_data:
            return None, f'NON_STANDARD_GAAP_TAGS (Cash:{bool(cash_data)}, R&D:{bool(rnd_data)})'

        latest_cash = float(cash_data[-1]['val'])
        latest_rnd = float(rnd_data[-1]['val']) * 4.0 
        
        if latest_rnd == 0:
            return None, 'ZERO_RD_EXPENSE'
            
        runway_years = latest_cash / latest_rnd
        cash_pressure_score = max(10.0, min(95.0, 100.0 - (runway_years * 40.0)))
        
        return cash_pressure_score, None
    except Exception as e:
        return None, f'SEC_PARSING_EXCEPTION: {str(e)}'

    
    try:
        url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
        
        # 加上 time.sleep 防止被 SEC 封禁 IP (每次请求停顿 0.2 秒)
        time.sleep(0.2) 
        
        resp = requests.get(url, headers=SEC_HEADERS, timeout=10)
        if resp.status_code != 200:
            print(f"⚠️ [{ticker}] SEC 拒绝访问 (HTTP {resp.status_code})")
            return 50.0, 'SEC_MISSING'
            
        facts = resp.json().get('facts', {}).get('us-gaap', {})
        
        # 1. 扩充“现金”的抓取词库
        cash_data = None
        for cash_tag in ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'CashAndCashEquivalentsAtCarryingValueIncludingDiscontinuedOperations']:
            if cash_tag in facts:
                cash_data = facts[cash_tag].get('units', {}).get('USD', [])
                if cash_data: break
                
        # 2. 扩充“研发费用”的抓取词库
        rnd_data = None
        for rnd_tag in ['ResearchAndDevelopmentExpense', 'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost']:
            if rnd_tag in facts:
                rnd_data = facts[rnd_tag].get('units', {}).get('USD', [])
                if rnd_data: break
        
        if not cash_data or not rnd_data:
            print(f"⚠️ [{ticker}] 财报标签不标准 (Cash抓取: {bool(cash_data)}, R&D抓取: {bool(rnd_data)})")
            return 50.0, 'SEC_MISSING' 

        latest_cash = float(cash_data[-1]['val'])
        latest_rnd = float(rnd_data[-1]['val']) * 4.0 
        
        if latest_rnd == 0:
            return 50.0, 'SEC_MISSING'
            
        runway_years = latest_cash / latest_rnd
        cash_pressure_score = max(10.0, min(95.0, 100.0 - (runway_years * 40.0)))
        
        return cash_pressure_score, None
    except Exception as e:
        print(f"❌ SEC 解析失败 {ticker}: {e}")
        return 50.0, 'SEC_MISSING'

# ==========================================
# 3. 医药核心数据源抓取模块 (Clinical & 真实MarketData过滤)
# ==========================================
def fetch_clinical_trials(company_name):
    """通过 ClinicalTrials.gov API v2 抓取企业后期临床试验"""
    try:
        url = f"https://clinicaltrials.gov/api/v2/studies?query.term={company_name}&filter.advanced=AREA[OverallStatus]ACTIVE_NOT_RECRUITING OR AREA[OverallStatus]RECRUITING&pageSize=1"
        headers = {"accept": "application/json"}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("studies") and len(data["studies"]) > 0:
            study = data["studies"][0]["protocolSection"]
            title = study["identificationModule"].get("briefTitle", "Unknown Trial")
            phase = study["designModule"].get("phases", ["Phase Unknown"])[0]
            return {"desc": f"Active Lead Trial: {title} ({phase})", "phase": phase}
        return {"desc": "No late-stage active trials found.", "phase": "None"}
    except Exception as e:
        return {"desc": "Clinical trials API fetch error.", "phase": "None"}

def fetch_market_data(ticker_symbol):
    """真实MarketData过滤：只抓取 OTM (价外10%以上)，且成交量巨幅放大的看涨期权"""
    if not MARKETDATA_TOKEN:
        return {"price": "N/A", "options_signal": "Normal (Token Missing)", "has_anomaly": False, "raw_signals": []}
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    price = "N/A"
    try:
        stock_url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker_symbol}?from={yesterday_str}&to={yesterday_str}"
        stock_resp = requests.get(stock_url, headers=headers, timeout=10)
        stock_data = stock_resp.json()
        if stock_data.get("s") == "ok" and "c" in stock_data:
            price = stock_data.get("c")[0]
    except Exception:
        pass
        
    options_signal = "Normal Options Flow"
    has_anomaly = False
    raw_signals = [] 
    
    try:
        opt_url = f"https://api.marketdata.app/v1/options/chain/{ticker_symbol}?date={yesterday_str}"
        opt_resp = requests.get(opt_url, headers=headers, timeout=10)
        opt_data = opt_resp.json()
        
        if opt_data.get("s") == "ok" and price != "N/A":
            strikes = opt_data.get('strike', [])
            sides = opt_data.get('side', [])
            volumes = opt_data.get('volume', [])
            ois = opt_data.get('openInterest', [])
            
            anomalies = []
            for i in range(len(strikes)):
                side = str(sides[i]).lower()
                strike = float(strikes[i])
                vol = float(volumes[i])
                oi = float(ois[i]) if ois[i] else 0.0
                
                # 严格过滤法则
                if side not in ['call', 'c']: continue 
                if strike <= float(price) * 1.10: continue 
                if vol < 100: continue 
                
                # 成交量暴增探测
                if oi > 0 and vol > (oi * 1.5):
                    anomaly_desc = f"Strike ${strike} Call Sweep (Vol: {int(vol)} vs OI: {int(oi)})"
                    anomalies.append(anomaly_desc)
                    raw_signals.append({"type": "OPTIONS", "date": "T-1 EOD", "desc": anomaly_desc, "mood": "HIGH-INTENT"})
                elif oi == 0 and vol > 500: 
                    anomaly_desc = f"Strike ${strike} Call New Opening (Vol: {int(vol)})"
                    anomalies.append(anomaly_desc)
                    raw_signals.append({"type": "OPTIONS", "date": "T-1 EOD", "desc": anomaly_desc, "mood": "HIGH-INTENT"})
            
            if anomalies:
                options_signal = f"Institutional OTM Call Sweeps Detected: {', '.join(anomalies[:2])}"
                has_anomaly = True

    except Exception as e:
        options_signal = f"Options Data Error: {e}"

    return {"price": price, "options_signal": options_signal, "has_anomaly": has_anomaly, "raw_signals": raw_signals}

# ==========================================
# 4. AI M&A 分析大脑 (DeepSeek 容灾版)
# ==========================================
def get_ai_digest(ticker, market_data, clin_data, quant_scores):
    url = "https://api.deepseek.com/chat/completions"
    if not DEEPSEEK_KEY: return "AI analysis failed due to missing API key."

    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    
    # 核心优化：把 Python 算出来的真实量化分数，喂给 AI，强制它输出具体数字！
    prompt = f"""
    You are a quantitative bio-pharma M&A analyst for BioQuantix.
    Analyze the following EOD data for {ticker}:
    - Market Data: Previous Close Price ${market_data['price']}
    - Clinical Pipeline: {clin_data['desc']}
    - Institutional Options Activity: {market_data['options_signal']}
    
    Algorithmic Engine Scores (Based on SEC & Sector Data):
    - Cash Pressure Score: {quant_scores['c_score']:.1f}/100
    - Asset Scarcity Score: {quant_scores['t_score']:.1f}/100
    - Catalyst Score: {quant_scores['m_score']:.1f}/100
    - OVERALL QUANT SCORE: {quant_scores['final_score']:.1f}/100
    
    Write a highly professional, 150-word "Strategic Digest" assessing acquisition probability.
    Structure strictly into: 
    1. Strategic Rationale
    2. Market Intelligence
    3. VERDICT (Must explicitly state the Overall Quant Score and provide a quantitative estimated M&A premium percentage based on the data).
    Do not give financial advice. Keep it analytical and objective.
    """
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a quantitative bio-pharma M&A AI analyst."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
        resp.raise_for_status() 
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"DeepSeek API Error for {ticker}: {e}")
        # 修改：将具体的真实报错原因传回，而不是仅仅返回一个统一的标记
        return f"FAILED_TIMEOUT: {str(e)}"

# ==========================================
# 5. 自动化主流程 (动态清洗与入库)
# ==========================================
def main():
    print("🚀 BioQuantix EOD Auto-Update Engine Started...")
    
    # 获取字典库
    TARGET_SCARCITY_MAP = {}
    try:
        dict_resp = supabase.table('target_dict').select('*').execute()
        TARGET_SCARCITY_MAP = {row['mechanism']: row['score'] for row in dict_resp.data}
    except Exception as e:
        print("⚠️ target_dict 表拉取失败，将使用代码内建备用字典")
        TARGET_SCARCITY_MAP = {
            "Oral GLP-1 / Dual Agonist": 95, "Auto-CAR-T": 90, 
            "ADC (Antibody-Drug Conjugate)": 85, "FGF21 / MASH Combos": 85, 
            "FcRn Inhibitor": 80, "Standard Oncology / mAb": 60 
        }

    # 获取监控池
    try:
        response = supabase.table('watchlist').select('*').eq('is_active', True).execute()
        targets = response.data
        if not targets:
            print("⚠️ Watchlist 为空。")
            return
    except Exception as e:
        print(f"❌ 读取 watchlist 失败: {e}")
        return

    success_count = 0
    fail_count = 0

    for target in targets:
        ticker = target["ticker"]
        name = target["name"]
        mechanism = target.get("mechanism", "Unknown")
        
        # =======================================================
        # 新增：优先拉取当前数据库里的历史数据作为备份 (Fallback)
        # =======================================================
        historical_data = None
        try:
            hist_resp = supabase.table('assets').select('*').eq('ticker', ticker).execute()
            if hist_resp.data and len(hist_resp.data) > 0:
                historical_data = hist_resp.data[0]
        except Exception as e:
            print(f"⚠️ [{ticker}] 无法读取历史缓存: {e}")

        clin_data = fetch_clinical_trials(name)
        market_data = fetch_market_data(ticker)
        
        error_logs = [] # <--- 新增：专门用于收集底层真实报错的列表
        
        # 市场数据降级处理 (对外展示纯英文)
        if market_data["options_signal"].startswith("Options Data Error"):
            error_logs.append(f"MarketData Error: {market_data['options_signal']}") # 记录真实失败原因
            if historical_data and historical_data.get('shadow_signals'):
                market_data["raw_signals"] = historical_data['shadow_signals']
            else:
                market_data["raw_signals"] = [{"type": "SYSTEM", "date": "T-1 EOD", "desc": "Data source feedback delayed. Using historical baseline.", "mood": "DELAYED"}]

        # 1. 真实 Cash Score (跑真实财报 + 历史缓存缝合)
        c_score_raw, sec_error_detail = fetch_sec_financials(ticker)
        sec_warning_flag = None
        
        if c_score_raw is None:
            print(f"⚠️ [{ticker}] SEC 抓取失败 ({sec_error_detail})，尝试调用历史数据...")
            sec_warning_flag = 'SEC_MISSING' 
            error_logs.append(f"SEC Error: {sec_error_detail}") # 记录真实失败原因
            
            if historical_data and historical_data.get('cash_score'):
                c_score = historical_data['cash_score']
                print(f"   -> 成功借用历史 Cash Score: {c_score}")
            else:
                c_score = 50.0
                print(f"   -> 无历史记录，启用中立值 50.0")
        else:
            c_score = c_score_raw
        
        # 2. 真实 Scarcity Score (匹配小抄字典)
        t_score = TARGET_SCARCITY_MAP.get(mechanism, 60.0)
        
        # 3. 真实 Milestone Score (解析临床阶段)
        m_score = 50.0
        if "Phase 3" in clin_data["phase"]: m_score = 90.0
        elif "Phase 2" in clin_data["phase"]: m_score = 75.0
        
        # 4. 估值分数
        v_score = 70.0
        
        # --- 核心高阶加权打分公式 ---
        # 权重: 现金压力(30%) + 靶点稀缺(40%) + 里程碑(20%) + 估值(10%)
        base_s_score = (c_score * 0.3) + (t_score * 0.4) + (m_score * 0.2) + (v_score * 0.1)
        
        # 期权异动修正系数 (F_adj)
        final_score = base_s_score * 1.15 if market_data["has_anomaly"] else base_s_score
        final_score = round(min(final_score, 99.5), 1) # 封顶
        
        print(f"[{ticker}] 计算完毕 | C:{c_score:.1f} T:{t_score:.1f} M:{m_score:.1f} | 最终分: {final_score}")

        # 将真实分数打包，传给 AI 大脑
        quant_scores = {
            "c_score": c_score,
            "t_score": t_score,
            "m_score": m_score,
            "final_score": final_score
        }
        ai_digest = get_ai_digest(ticker, market_data, clin_data, quant_scores)
        
        # AI 容灾处理 (缝合历史研报或全英文中立文案，不再直接 continue 丢弃数据)
        if ai_digest.startswith("FAILED_TIMEOUT"):
            print(f"⚠️ [{ticker}] AI 分析超时，尝试调用历史研报...")
            sec_warning_flag = 'AI_TIMEOUT' 
            error_logs.append(f"AI Error: {ai_digest}") # 记录真实失败原因
            
            if historical_data and historical_data.get('digest'):
                ai_digest = historical_data['digest']
                print(f"   -> 成功借用历史 AI Digest")
            else:
                ai_digest = "Data source feedback delayed. Maintaining neutral observation status pending API synchronization.\n\nVERDICT: Neutral. Awaiting data refresh."
                print(f"   -> 无历史记录，启用全英文中立文案")
            
        success_count += 1
        
        error_log_str = " | ".join(error_logs) if error_logs else None # 组合所有报错信息
        
        # 组装入库数据
        db_record = {
            "ticker": ticker,
            "name": name,
            "score": final_score,
            "cash_score": c_score,
            "scarcity_score": t_score,
            "milestone_score": m_score,
            "valuation_score": v_score,
            "shadow_signals": market_data["raw_signals"], 
            "digest": ai_digest,
            "target_area": target["target_area"],
            "is_past_deal": target["is_past_deal"],
            "warning_flag": sec_warning_flag,
            "error_log": error_log_str # <--- 核心：将底层真实的失败信息存入数据库！
        }
        
        if "deal_info" in target and target["deal_info"]:
             db_record["deal_info"] = target["deal_info"]
        
        # 更新主表
        try:
            supabase.table('assets').upsert(db_record).execute()
        except Exception as e:
            print(f"❌ {ticker} 写入 assets 失败: {e}")
            
        # 历史暗储：写入日志表
        try:
            history_record = {
                "ticker": ticker,
                "score": final_score,
                "warning_flag": sec_warning_flag,
                "error_log": error_log_str # <--- 历史表同样保留真实失败记录
            }
            supabase.table('assets_history_log').insert(history_record).execute()
        except Exception as e:
            pass 

    summary_msg = f"成功跑通: {success_count}条，失败拦截: {fail_count}条。"
    send_alert("BioQuantix 日常更新完成", summary_msg)
    print("🎉 所有医药标的 EOD 更新执行结束！")

if __name__ == "__main__":
    main()
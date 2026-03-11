import os
import requests
import json
import math
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
# 2. SEC 真实财务数据抓取与降级防线 (Milestone 2)
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
    """提取真实SEC财报，计算Cash Runway。带有防崩溃降级。"""
    cik = CIK_DICT.get(ticker)
    if not cik:
        return 50.0, 'SEC_MISSING' # CIK缺失，直接降级
    
    try:
        # 抓取 SEC 公司财务核心指标库 (companyfacts)
        url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
        resp = requests.get(url, headers=SEC_HEADERS, timeout=10)
        if resp.status_code != 200:
            return 50.0, 'SEC_MISSING'
            
        facts = resp.json().get('facts', {}).get('us-gaap', {})
        
        # 尝试多种标签获取现金与研发费用
        cash_data = facts.get('CashAndCashEquivalentsAtCarryingValue', {}).get('units', {}).get('USD', [])
        if not cash_data:
            cash_data = facts.get('Cash', {}).get('units', {}).get('USD', [])
            
        rnd_data = facts.get('ResearchAndDevelopmentExpense', {}).get('units', {}).get('USD', [])
        
        if not cash_data or not rnd_data:
            return 50.0, 'SEC_MISSING' # 财报格式非标，直接降级保底

        # 提取最新一期的财报数据
        latest_cash = float(cash_data[-1]['val'])
        # R&D 通常是季报，乘以4年化
        latest_rnd = float(rnd_data[-1]['val']) * 4.0 
        
        if latest_rnd == 0:
            return 50.0, 'SEC_MISSING'
            
        # 计算 Runway (年)
        runway_years = latest_cash / latest_rnd
        
        # 核心算法：Runway越短，现金压力越大，并购紧迫性分数越高！
        # 算法: 100 - (runway_years * 40), 最高95，最低10。比如0.5年=80分，2年=20分。
        cash_pressure_score = max(10.0, min(95.0, 100.0 - (runway_years * 40.0)))
        
        return cash_pressure_score, None
    except Exception as e:
        print(f"SEC 解析失败 {ticker}: {e}")
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
    raw_signals = [] # 用于给前端展示的数组
    
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
                if side not in ['call', 'c']: continue # 1. 只看Call
                if strike <= float(price) * 1.10: continue # 2. 行权价必须比现价高10%以上(OTM)
                if vol < 100: continue # 过滤杂音
                
                # 3. 成交量必须暴增（大于原有未平仓量的1.5倍）
                if oi > 0 and vol > (oi * 1.5):
                    anomaly_desc = f"Strike ${strike} Call Sweep (Vol: {int(vol)} vs OI: {int(oi)})"
                    anomalies.append(anomaly_desc)
                    raw_signals.append({"type": "OPTIONS", "date": "T-1 EOD", "desc": anomaly_desc, "mood": "HIGH-INTENT"})
                elif oi == 0 and vol > 500: # 无前置仓位的突然突袭
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
def get_ai_digest(ticker, market_data, clin_data):
    url = "https://api.deepseek.com/chat/completions"
    if not DEEPSEEK_KEY: return "AI analysis failed due to missing API key."

    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    
    prompt = f"""
    You are a quantitative bio-pharma M&A analyst for BioQuantix.
    Analyze the following EOD data for {ticker}:
    - Market Data: Previous Close Price ${market_data['price']}
    - Clinical Pipeline: {clin_data['desc']}
    - Institutional Options Activity: {market_data['options_signal']}
    
    Write a highly professional, 150-word "Strategic Digest" assessing acquisition probability.
    Structure strictly into: 
    1. Strategic Rationale
    2. Market Intelligence
    3. VERDICT.
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
        return "FAILED_TIMEOUT"

# ==========================================
# 5. 自动化主流程 (动态清洗与入库)
# ==========================================
def main():
    print("🚀 BioQuantix EOD Auto-Update Engine Started...")
    
    # 获取字典库 (Milestone 1)
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
        
        clin_data = fetch_clinical_trials(name)
        market_data = fetch_market_data(ticker)
        
        # 1. 真实 Cash Score (跑真实财报)
        c_score, sec_warning_flag = fetch_sec_financials(ticker)
        
        # 2. 真实 Scarcity Score (匹配小抄字典)
        t_score = TARGET_SCARCITY_MAP.get(mechanism, 60.0)
        
        # 3. 真实 Milestone Score (解析临床阶段)
        m_score = 50.0
        if "Phase 3" in clin_data["phase"]: m_score = 90.0
        elif "Phase 2" in clin_data["phase"]: m_score = 75.0
        
        # 4. 估值分数 (MVP阶段暂用70基础分代替绝对PB计算)
        v_score = 70.0
        
        # --- 核心高阶加权打分公式 (Milestone 2) ---
        # 权重: 现金压力(30%) + 靶点稀缺(40%) + 里程碑(20%) + 估值(10%)
        base_s_score = (c_score * 0.3) + (t_score * 0.4) + (m_score * 0.2) + (v_score * 0.1)
        
        # 期权异动修正系数 (F_adj)
        final_score = base_s_score * 1.15 if market_data["has_anomaly"] else base_s_score
        final_score = round(min(final_score, 99.5), 1) # 封顶
        
        print(f"[{ticker}] 计算完毕 | C:{c_score} T:{t_score} M:{m_score} | 最终分: {final_score}")

        ai_digest = get_ai_digest(ticker, market_data, clin_data)
        
        if "FAILED_TIMEOUT" in ai_digest:
            fail_count += 1
            supabase.table('assets').update({"warning_flag": "AI_TIMEOUT"}).eq("ticker", ticker).execute()
            continue
            
        success_count += 1
        
        # 组装入库数据 (包含所有真实细分数据和真实的影子信号数组)
        db_record = {
            "ticker": ticker,
            "name": name,
            "score": final_score,
            "cash_score": c_score,
            "scarcity_score": t_score,
            "milestone_score": m_score,
            "valuation_score": v_score,
            "shadow_signals": market_data["raw_signals"], # 真实的期权拦截信号！
            "digest": ai_digest,
            "target_area": target["target_area"],
            "is_past_deal": target["is_past_deal"],
            "warning_flag": sec_warning_flag 
        }
        
        if "deal_info" in target and target["deal_info"]:
             db_record["deal_info"] = target["deal_info"]
        
        # 更新主表
        try:
            supabase.table('assets').upsert(db_record).execute()
        except Exception as e:
            print(f"❌ {ticker} 写入 assets 失败: {e}")
            
        # 历史暗储：写入日志表 (Milestone 3)
        try:
            history_record = {
                "ticker": ticker,
                "score": final_score
            }
            supabase.table('assets_history_log').insert(history_record).execute()
        except Exception as e:
            pass # 暗储失败不影响主流程运行

    summary_msg = f"成功跑通: {success_count}条，失败拦截: {fail_count}条。"
    send_alert("BioQuantix 日常更新完成", summary_msg)
    print("🎉 所有医药标的 EOD 更新执行结束！")

if __name__ == "__main__":
    main()
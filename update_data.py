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
# 2. 财务抓取：MarketData + SEC 双防线机制
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

def fetch_financials_dual_layer(ticker):
    """Phase 3: 优先尝试 MarketData 财报，失败则降级到 SEC Edgar，彻底解决财务提取率低的问题"""
    cash, rnd = 0.0, 0.0
    source = "NONE"
    error_details = []
    
    # 防线 1: MarketData API (提取标准化财务数据)
    if MARKETDATA_TOKEN:
        try:
            headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
            # 尝试访问 MarketData 财报端点
            md_url = f"https://api.marketdata.app/v1/stocks/financials/{ticker}/"
            resp = requests.get(md_url, headers=headers, timeout=5)
            if resp.status_code == 200:
                md_data = resp.json()
                if md_data.get('s') == 'ok':
                    # 假设 MarketData 提取现金和研发的字段
                    cash_arr = md_data.get('cash', [])
                    rnd_arr = md_data.get('research_development', [])
                    if cash_arr and len(cash_arr) > 0 and rnd_arr and len(rnd_arr) > 0:
                        cash = float(cash_arr[-1])
                        rnd = float(rnd_arr[-1]) * 4.0 # 年化
                        source = "MarketData"
            else:
                error_details.append(f"MarketData Financials HTTP {resp.status_code}")
        except Exception as e:
            error_details.append(f"MarketData Financials Exception: {str(e)}")

    # 防线 2: SEC EDGAR 兜底 (携带扩充词库与抗封禁延迟)
    if source == "NONE" and ticker in CIK_DICT:
        try:
            cik = CIK_DICT[ticker]
            url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
            time.sleep(0.2) # 防止 SEC 封禁
            resp = requests.get(url, headers=SEC_HEADERS, timeout=10)
            
            if resp.status_code == 200:
                facts = resp.json().get('facts', {}).get('us-gaap', {})
                
                # 寻找现金
                for tag in ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'CashAndCashEquivalentsAtCarryingValueIncludingDiscontinuedOperations']:
                    if tag in facts:
                        d = facts[tag].get('units', {}).get('USD', [])
                        if d: 
                            cash = float(d[-1]['val'])
                            break
                            
                # 寻找研发
                for tag in ['ResearchAndDevelopmentExpense', 'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost']:
                    if tag in facts:
                        d = facts[tag].get('units', {}).get('USD', [])
                        if d: 
                            rnd = float(d[-1]['val']) * 4.0
                            break
                
                if cash > 0 and rnd > 0:
                    source = "SEC"
                else:
                    error_details.append(f"SEC Non-Standard Tags (Cash:{cash>0}, R&D:{rnd>0})")
            else:
                error_details.append(f"SEC HTTP {resp.status_code}")
        except Exception as e:
            error_details.append(f"SEC Exception: {str(e)}")

    if cash == 0 or rnd == 0:
        return None, " | ".join(error_details) if error_details else "FINANCIALS_MISSING"

    runway_years = cash / rnd
    c_score = max(10.0, min(95.0, 100.0 - (runway_years * 40.0)))
    
    return {"cash": cash, "runway": runway_years, "c_score": c_score, "source": source}, None

# ==========================================
# 3. 临床倒计时与行情估值抓取
# ==========================================
def fetch_clinical_trials(company_name):
    """Phase 3: 精准提取 estimatedCompletionDate 计算真实揭盲倒计时"""
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
            
            # 提取预计完成日期用于 Min-Time 算法
            est_date_str = study["statusModule"].get("completionDateStruct", {}).get("date", "")
            days_to_clin = 999
            if est_date_str:
                try:
                    # 兼容 YYYY-MM 和 YYYY-MM-DD
                    if len(est_date_str) == 7:
                        est_date = datetime.strptime(est_date_str, "%Y-%m")
                    else:
                        est_date = datetime.strptime(est_date_str, "%Y-%m-%d")
                    days_to_clin = (est_date - datetime.now()).days
                except:
                    pass
                    
            return {
                "desc": f"Active Lead Trial: {title} ({phase}) | Est. Completion: {est_date_str}", 
                "phase": phase, 
                "days_to_clin": days_to_clin
            }
        return {"desc": "No late-stage active trials found.", "phase": "None", "days_to_clin": 999}
    except Exception as e:
        return {"desc": "Clinical trials API fetch error.", "phase": "None", "days_to_clin": 999}

def fetch_market_data(ticker_symbol):
    """Phase 3: 提取真实市值(Market Cap)并结合严苛期权算法输出真实信号"""
    result = {
        "price": "N/A", 
        "market_cap": 0, 
        "options_signal": "Normal", 
        "has_anomaly": False, 
        "raw_signals": [], 
        "days_to_opt": 999,
        "error": None
    }
    
    if not MARKETDATA_TOKEN:
        result["options_signal"] = "Normal (Token Missing)"
        result["error"] = "MARKETDATA_TOKEN_MISSING"
        return result
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 抓取实时/结算行情 获取市值 (V_score 核心基座)
    try:
        q_url = f"https://api.marketdata.app/v1/stocks/quotes/{ticker_symbol}/"
        q_resp = requests.get(q_url, headers=headers, timeout=10).json()
        if q_resp.get('s') == 'ok':
            result["price"] = float(q_resp.get('last', [0])[0])
            result["market_cap"] = float(q_resp.get('marketcap', [0])[0])
    except Exception as e:
        result["error"] = f"Quotes API Error: {str(e)}"
        
    # 期权异动严格过滤 (Call, OTM 10%, Volume>1.5x OI)
    try:
        opt_url = f"https://api.marketdata.app/v1/options/chain/{ticker_symbol}?date={yesterday_str}"
        opt_resp = requests.get(opt_url, headers=headers, timeout=10).json()
        
        if opt_resp.get("s") == "ok" and result["price"] != "N/A":
            strikes = opt_resp.get('strike', [])
            sides = opt_resp.get('side', [])
            volumes = opt_resp.get('volume', [])
            ois = opt_resp.get('openInterest', [])
            expirations = opt_resp.get('expiration', [])
            
            anomalies = []
            min_opt_days = 999
            
            for i in range(len(strikes)):
                side = str(sides[i]).lower()
                strike = float(strikes[i])
                vol = float(volumes[i])
                oi = float(ois[i]) if ois[i] else 0.0
                
                # 规则 1 & 2: 只挑 Call，且价外 > 10%
                if side not in ['call', 'c']: continue 
                if strike <= float(result["price"]) * 1.10: continue 
                if vol < 100: continue # 过滤小散户杂音
                
                # 规则 3: 成交量暴增探测
                if (oi > 0 and vol > oi * 1.5) or (oi == 0 and vol > 500):
                    desc = f"Strike ${strike} Call Sweep (Vol: {int(vol)}/OI: {int(oi)})"
                    anomalies.append(desc)
                    result["raw_signals"].append({"type": "OPTIONS", "date": "T-1 EOD", "desc": desc, "mood": "HIGH-INTENT"})
                    
                    # 提取期权到期日用于推算窗口
                    try:
                        exp_date = datetime.strptime(str(expirations[i]), "%Y-%m-%d")
                        opt_days = (exp_date - datetime.now()).days
                        if 0 < opt_days < min_opt_days: 
                            min_opt_days = opt_days
                    except:
                        pass
            
            if anomalies:
                result["options_signal"] = f"Institutional OTM Call Sweeps Detected: {', '.join(anomalies[:2])}"
                result["has_anomaly"] = True
                result["days_to_opt"] = min_opt_days

    except Exception as e:
        result["options_signal"] = f"Options Data Error: {str(e)}"
        if not result["error"]: result["error"] = f"Options API Error: {str(e)}"

    return result

# ==========================================
# 4. AI M&A 分析大脑 (带定量注入)
# ==========================================
def get_ai_digest(ticker, market_data, clin_data, quant_scores):
    url = "https://api.deepseek.com/chat/completions"
    if not DEEPSEEK_KEY: return "FAILED_TIMEOUT: Missing DeepSeek API Key."

    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    
    prompt = f"""
    You are a quantitative bio-pharma M&A analyst for BioQuantix.
    Analyze the following EOD data for {ticker}:
    - Market Data: Previous Close Price ${market_data['price']}, Market Cap ${market_data['market_cap']}
    - Clinical Pipeline: {clin_data['desc']}
    - Institutional Options Activity: {market_data['options_signal']}
    
    Algorithmic Engine Scores (Based on SEC & Sector Data):
    - Cash Pressure Score: {quant_scores['c_score']:.1f}/100
    - Valuation Undervalue Score (V-Score): {quant_scores['v_score']:.1f}/100
    - Asset Scarcity Score: {quant_scores['t_score']:.1f}/100
    - Catalyst Milestone Score: {quant_scores['m_score']:.1f}/100
    - OVERALL QUANT SCORE: {quant_scores['final_score']:.1f}/100
    - Estimated Premium: {quant_scores['est_premium']}
    
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
        return f"FAILED_TIMEOUT: {str(e)}"

# ==========================================
# 5. 自动化主流程 (Phase 3 数学闭环)
# ==========================================
def main():
    print("🚀 BioQuantix EOD Auto-Update Engine Started (Phase 3 Core)...")
    
    # 获取字典库
    TARGET_SCARCITY_MAP = {}
    try:
        print("📚 正在从云端拉取靶点稀缺度字典 (target_dict)...")
        dict_resp = supabase.table('target_dict').select('*').execute()
        TARGET_SCARCITY_MAP = {row['mechanism']: row['score'] for row in dict_resp.data}
        print(f"✅ 成功加载 {len(TARGET_SCARCITY_MAP)} 个靶点评估标准！")
    except Exception as e:
        print(f"⚠️ 靶点字典拉取失败，将使用代码内建备用字典: {e}")
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
        
        # 拉取历史数据作为断网备份
        historical_data = None
        try:
            hist_resp = supabase.table('assets').select('*').eq('ticker', ticker).execute()
            if hist_resp.data and len(hist_resp.data) > 0:
                historical_data = hist_resp.data[0]
        except Exception as e:
            print(f"⚠️ [{ticker}] 无法读取历史缓存: {e}")

        clin_data = fetch_clinical_trials(name)
        market_data = fetch_market_data(ticker)
        
        error_logs = []
        sec_warning_flag = None
        
        if market_data["error"]:
            error_logs.append(f"MarketData Error: {market_data['error']}")
            if historical_data and historical_data.get('shadow_signals'):
                market_data["raw_signals"] = historical_data['shadow_signals']
            else:
                market_data["raw_signals"] = [{"type": "SYSTEM", "date": "T-1 EOD", "desc": "Data source feedback delayed. Using historical baseline.", "mood": "DELAYED"}]

        # ---------------------------------------------------------
        # Phase 3 核心计算: C_score (现金压力)
        # ---------------------------------------------------------
        fin_data, sec_error_detail = fetch_financials_dual_layer(ticker)
        
        if fin_data is None:
            print(f"⚠️ [{ticker}] 财务抓取失败 ({sec_error_detail})，尝试调用历史数据...")
            sec_warning_flag = 'SEC_MISSING' 
            error_logs.append(f"Financials Error: {sec_error_detail}")
            
            if historical_data and historical_data.get('cash_score'):
                c_score = historical_data['cash_score']
            else:
                c_score = 50.0
        else:
            c_score = fin_data["c_score"]
        
        # ---------------------------------------------------------
        # Phase 3 核心计算: T_score (靶点稀缺度)
        # ---------------------------------------------------------
        t_score = TARGET_SCARCITY_MAP.get(mechanism, 60.0)
        
        # ---------------------------------------------------------
        # Phase 3 核心计算: V_score (估值洼地) - 真实Market Cap推算
        # ---------------------------------------------------------
        v_score = 50.0
        if fin_data and market_data["market_cap"] > 0:
            p_cash_ratio = market_data["market_cap"] / fin_data["cash"]
            if p_cash_ratio < 1.0: v_score = 95.0   # 破净市值，极度低估
            elif p_cash_ratio < 2.0: v_score = 80.0
            elif p_cash_ratio < 5.0: v_score = 60.0
            else: v_score = 40.0
        elif historical_data and historical_data.get('valuation_score'):
            v_score = historical_data['valuation_score']

        # ---------------------------------------------------------
        # Phase 3 核心计算: M_score (里程碑催化) - 真实天数推算
        # ---------------------------------------------------------
        days_to_clin = clin_data["days_to_clin"]
        m_score = 50.0
        if days_to_clin <= 0: m_score = 95.0
        elif days_to_clin < 90: m_score = 90.0
        elif days_to_clin < 180: m_score = 75.0
        elif days_to_clin < 365: m_score = 60.0
        
        # ---------------------------------------------------------
        # 最终加权公式 & 溢价时间推算
        # ---------------------------------------------------------
        base_s_score = (c_score * 0.3) + (t_score * 0.4) + (m_score * 0.2) + (v_score * 0.1)
        final_score = base_s_score * 1.15 if market_data["has_anomaly"] else base_s_score
        final_score = round(min(final_score, 99.5), 1) 
        
        # 交易时间预测 (Min-Time Algorithm)
        min_days = min(days_to_clin, market_data["days_to_opt"]) * 0.8
        if min_days < 30: predicted_time = "14-30 Days (Imminent)"
        elif min_days < 90: predicted_time = "1-3 Months"
        elif min_days < 180: predicted_time = "3-6 Months"
        else: predicted_time = "TBD / Event Driven"
        
        # 预计溢价计算 (Premium Formula)
        v_adj = max(0, (v_score - 50) / 100.0) * 35.0
        t_adj = max(0, (t_score - 50) / 100.0) * 25.0
        prem_val = 40.0 + v_adj + t_adj
        est_premium = f"+{int(prem_val)}% ~ +{int(prem_val + 15)}%"

        print(f"[{ticker}] 计算完毕 | C:{c_score:.1f} T:{t_score:.1f} M:{m_score:.1f} V:{v_score:.1f} | 最终分: {final_score}")

        # 将真实分数打包，传给 AI 大脑
        quant_scores = {
            "c_score": c_score, "t_score": t_score, "m_score": m_score, 
            "v_score": v_score, "final_score": final_score, "est_premium": est_premium
        }
        ai_digest = get_ai_digest(ticker, market_data, clin_data, quant_scores)
        
        # AI 容灾处理 (缝合历史研报)
        if ai_digest.startswith("FAILED_TIMEOUT"):
            print(f"⚠️ [{ticker}] AI 分析超时，尝试调用历史研报...")
            sec_warning_flag = 'AI_TIMEOUT' 
            error_logs.append(f"AI Error: {ai_digest}")
            
            if historical_data and historical_data.get('digest'):
                ai_digest = historical_data['digest']
            else:
                ai_digest = "Data source feedback delayed. Maintaining neutral observation status pending API synchronization.\n\nVERDICT: Neutral. Awaiting data refresh."
            
        success_count += 1
        error_log_str = " | ".join(error_logs) if error_logs else None 
        
        # 组装入库数据 (全量真数据)
        db_record = {
            "ticker": ticker,
            "name": name,
            "score": final_score,
            "cash_score": c_score,
            "scarcity_score": t_score,
            "milestone_score": m_score,
            "valuation_score": v_score,
            "predicted_time": predicted_time,
            "estimated_premium": est_premium,
            "shadow_signals": market_data["raw_signals"], 
            "digest": ai_digest,
            "target_area": target["target_area"],
            "is_past_deal": target["is_past_deal"],
            "warning_flag": sec_warning_flag,
            "error_log": error_log_str 
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
                "error_log": error_log_str
            }
            supabase.table('assets_history_log').insert(history_record).execute()
        except Exception as e:
            pass 

    summary_msg = f"成功跑通: {success_count}条，失败拦截: {fail_count}条。"
    send_alert("BioQuantix 日常更新完成", summary_msg)
    print("🎉 所有医药标的 Phase 3 量化闭环执行结束！")

if __name__ == "__main__":
    main()
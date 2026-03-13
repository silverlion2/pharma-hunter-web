import os
import requests
import json
import math
import time
import argparse
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
# 2. 基础字典与 SEC 双防线机制
# ==========================================
SEC_HEADERS = {"User-Agent": "BioQuantix Quant Engine contact@bioquantix.com"}
CIK_DICT = {}
NAME_DICT = {} 

try:
    print("📥 正在拉取 SEC Ticker-CIK 全市场字典...")
    sec_resp = requests.get("https://www.sec.gov/files/company_tickers.json", headers=SEC_HEADERS, timeout=10)
    sec_resp.raise_for_status()
    sec_dict_raw = sec_resp.json()
    CIK_DICT = {item['ticker']: str(item['cik_str']).zfill(10) for item in sec_dict_raw.values()}
    NAME_DICT = {item['ticker']: item['title'] for item in sec_dict_raw.values()} 
    print(f"✅ SEC 字典加载成功！共计 {len(CIK_DICT)} 家美股上市企业。")
except Exception as e:
    print(f"❌ SEC 字典拉取失败: {e}")
    send_alert("系统警告", "SEC字典拉取失败，财务抓取将全面降级。")

# 【差分更新触发器】MarketData Earnings API
def check_earnings_catalyst(ticker):
    """
    检查公司的财报日历：
    1. 判断过去14天内是否刚发了财报 (用于触发财务数据刷新)
    2. 获取下一次财报发布的日期 (作为并购时间窗口的 Catalyst)
    """
    result = {
        "needs_financial_update": True, # 默认 True，保证没查到时安全刷新
        "next_earnings_date": "TBD",
        "last_earnings_date": None
    }
    
    if not MARKETDATA_TOKEN:
        return result
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    try:
        # countback=2 确保能拿到最近一次过去的财报和下一次未来的财报预计时间
        url = f"https://api.marketdata.app/v1/stocks/earnings/{ticker}/?countback=2"
        resp = requests.get(url, headers=headers, timeout=5).json()
        
        if resp.get('s') == 'ok':
            dates = resp.get('reportDate', [])
            now = datetime.now()
            
            for date_str in dates:
                try:
                    rep_date = datetime.strptime(str(date_str), "%Y-%m-%d")
                    # 如果财报日期在未来，记为下一次 Catalyst
                    if rep_date > now:
                        result["next_earnings_date"] = date_str
                    # 如果财报日期在过去
                    else:
                        result["last_earnings_date"] = date_str
                        days_since_report = (now - rep_date).days
                        # 如果是14天内刚发的财报，说明财务数据有变动，必须爬取 SEC
                        # 如果是很久以前发的，说明数据没变，可以跳过 SEC 爬取
                        result["needs_financial_update"] = days_since_report <= 14
                except:
                    pass
    except Exception as e:
        pass # 接口异常时保持 needs_financial_update 为 True，做安全降级
        
    return result

def fetch_financials_dual_layer(ticker):
    cash, rnd = 0.0, 0.0
    source = "NONE"
    error_details = []
    
    if MARKETDATA_TOKEN:
        try:
            headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
            md_url = f"https://api.marketdata.app/v1/stocks/financials/{ticker}/"
            resp = requests.get(md_url, headers=headers, timeout=5)
            if resp.status_code == 200:
                md_data = resp.json()
                if md_data.get('s') == 'ok':
                    cash_arr = md_data.get('cash', [])
                    rnd_arr = md_data.get('research_development', [])
                    if cash_arr and len(cash_arr) > 0 and rnd_arr and len(rnd_arr) > 0:
                        cash = float(cash_arr[-1])
                        rnd = float(rnd_arr[-1]) * 4.0 
                        source = "MarketData"
            else:
                error_details.append(f"MarketData Financials HTTP {resp.status_code}")
        except Exception as e:
            error_details.append(f"MarketData Financials Exception: {str(e)}")

    if source == "NONE" and ticker in CIK_DICT:
        try:
            cik = CIK_DICT[ticker]
            url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
            time.sleep(0.2) 
            resp = requests.get(url, headers=SEC_HEADERS, timeout=10)
            
            if resp.status_code == 200:
                facts = resp.json().get('facts', {}).get('us-gaap', {})
                
                for tag in ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'CashAndCashEquivalentsAtCarryingValueIncludingDiscontinuedOperations']:
                    if tag in facts:
                        d = facts[tag].get('units', {}).get('USD', [])
                        if d: 
                            cash = float(d[-1]['val'])
                            break
                            
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
            
            est_date_str = study["statusModule"].get("completionDateStruct", {}).get("date", "")
            days_to_clin = 999
            if est_date_str:
                try:
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
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"} if MARKETDATA_TOKEN else {}
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 1. 获取稳定收盘价: 通过 MarketData Candles 拉取过去 7 天最新的日线收盘价
    try:
        to_date = datetime.now()
        from_date = to_date - timedelta(days=7)
        c_url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker_symbol}/?from={from_date.strftime('%Y-%m-%d')}&to={to_date.strftime('%Y-%m-%d')}"
        c_resp = requests.get(c_url, headers=headers, timeout=10).json()
        if c_resp.get('s') == 'ok':
            c_arr = c_resp.get('c', [])
            if c_arr: result["price"] = float(c_arr[-1])
    except Exception as e:
        result["error"] = f"Candles API Error: {str(e)}"

    # 2. 算力兜底算市值: 彻底拉黑 Yahoo，直接提取 SEC 最新披露股本 × MarketData 最新收盘价
    if result["price"] != "N/A" and ticker_symbol in CIK_DICT:
        try:
            cik = CIK_DICT[ticker_symbol]
            sec_url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
            sec_resp = requests.get(sec_url, headers=SEC_HEADERS, timeout=5)
            if sec_resp.status_code == 200:
                facts = sec_resp.json().get('facts', {})
                # 优先获取 DEI 标准披露的总流通股本
                shares_data = facts.get('dei', {}).get('EntityCommonStockSharesOutstanding', {}).get('units', {}).get('shares', [])
                if not shares_data:
                    # 备用获取 GAAP 标准披露
                    shares_data = facts.get('us-gaap', {}).get('CommonStockSharesOutstanding', {}).get('units', {}).get('shares', [])
                
                if shares_data:
                    result["market_cap"] = float(shares_data[-1]['val']) * float(result["price"])
        except:
            pass

    # 3. 获取期权异动
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
                
                if side not in ['call', 'c']: continue 
                if strike <= float(result["price"]) * 1.10: continue 
                if vol < 100: continue 
                
                if (oi > 0 and vol > oi * 1.5) or (oi == 0 and vol > 500):
                    desc = f"Strike ${strike} Call Sweep (Vol: {int(vol)}/OI: {int(oi)})"
                    anomalies.append(desc)
                    result["raw_signals"].append({"type": "OPTIONS", "date": "T-1 EOD", "desc": desc, "mood": "HIGH-INTENT"})
                    
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
# 4. AI M&A 分析大脑
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
# 5. 宇宙扩容引擎 (基于 SEC SIC Code 纯量化扫描)
# ==========================================
def run_universe_expansion():
    print("=== 🚀 启动 BioQuantix 数据池扩容引擎 (Phase 6) ===")
    print("目标: 全盘扫描 SEC 数据库，筛选 SIC 2834 & 2836 且市值在 $50M - $15B 的临床药企。")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("🚨 错误: 环境变量缺失，将只在本地空跑打印结果！")
        is_dry_run = True
    else:
        is_dry_run = False

    valid_assets = []
    scan_limit = 150 # 为防止单次扫描时间过长，随机抽取或设置扫描上限
    scanned = 0
    
    # 遍历 SEC 的 CIK 字典 (过滤提取纯正的制药/生物科技企业)
    for ticker, cik in list(CIK_DICT.items()):
        if scanned >= scan_limit:
            break
            
        try:
            # Step 1: 验证 SIC Code (行业护城河)
            sec_sub_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
            sub_resp = requests.get(sec_sub_url, headers=SEC_HEADERS, timeout=5)
            
            if sub_resp.status_code != 200:
                time.sleep(0.11) # 严格遵守 SEC 的 10 req/sec 速率限制
                continue
                
            sub_data = sub_resp.json()
            sic_code = str(sub_data.get("sic", ""))
            
            if sic_code not in ["2834", "2836"]:
                time.sleep(0.11)
                continue # 不是创新药企，直接跳过
                
            scanned += 1
            name = sub_data.get("name", NAME_DICT.get(ticker, ticker))
            print(f"\n🔍 [SIC {sic_code} 命中] 正在评估标的: {ticker} ({name})...")
            
        except Exception as e:
            time.sleep(0.11)
            continue
            
        time.sleep(0.11)

        # Step 2: 验证市值区间 (MarketData 价格 + SEC 股本计算)
        market_cap = 0
        price = 0
        
        # 1. 拿最新价格 (最稳定的 MarketData Candles 历史日线)
        try:
            headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"} if MARKETDATA_TOKEN else {}
            to_date = datetime.now()
            from_date = to_date - timedelta(days=7)
            url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker}/?from={from_date.strftime('%Y-%m-%d')}&to={to_date.strftime('%Y-%m-%d')}"
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200 and resp.json().get('s') == 'ok':
                c_arr = resp.json().get('c', [])
                if c_arr: price = float(c_arr[-1])
        except Exception:
            pass

        # 2. 纯算力计算市值 (彻底废弃 Yahoo，使用 SEC 真实股本 × 收盘价)
        if price > 0:
            try:
                sec_url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
                sec_resp = requests.get(sec_url, headers=SEC_HEADERS, timeout=5)
                if sec_resp.status_code == 200:
                    facts = sec_resp.json().get('facts', {})
                    shares_data = facts.get('dei', {}).get('EntityCommonStockSharesOutstanding', {}).get('units', {}).get('shares', [])
                    if not shares_data:
                        shares_data = facts.get('us-gaap', {}).get('CommonStockSharesOutstanding', {}).get('units', {}).get('shares', [])
                    
                    if shares_data:
                        market_cap = float(shares_data[-1]['val']) * price
                        print(f"  ⚡ 算力计算成功: 股本({int(shares_data[-1]['val'])}) × 收盘价(${price}) = 市值 ${market_cap / 1e9:.3f}B")
            except Exception:
                pass

        if market_cap > 15_000_000_000:
            print(f"  ❌ [DROP] 巨头买方剔除 (市值 > $15B)")
            continue
        elif market_cap <= 0:
            print(f"  ❌ [DROP] 查无市值或已退市")
            continue
        else:
            print(f"  ✅ [PASS] 市值符合被收购区间: ${market_cap / 1e9:.3f}B")

        # Step 3: FDA 临床管线验证
        clin_data = fetch_clinical_trials(name)
        if clin_data["phase"] == "None" or "No late-stage active trials" in clin_data["desc"]:
            print(f"  ❌ [DROP] 缺乏活跃的后期临床管线")
            continue
            
        print(f"  🌟 [SUCCESS] 纳入标的池！管线阶段: {clin_data['phase']}")
        
        target_area = "Oncology" if hash(ticker) % 2 == 0 else "Metabolic"
        if "autoimmune" in clin_data['desc'].lower(): target_area = "Autoimmune"
        
        valid_assets.append({
            "ticker": ticker,
            "name": name,
            "mechanism": "TBD",
            "target_area": target_area,
            "is_active": True,
            "is_past_deal": False
        })

    if is_dry_run:
        print("\n[Dry Run] 环境变量缺失，跳过写入 Supabase，流程演示成功。")
        return

    # 批量 Upsert 写入 Watchlist 表
    print(f"\n开始将 {len(valid_assets)} 条优质标的写入 Watchlist 数据库...")
    for asset in valid_assets:
        try:
            supabase.table('watchlist').upsert(asset).execute()
        except Exception as e:
            print(f"写入失败 {asset['ticker']}: {e}")
            
    summary = f"宇宙扩容完成！已扫描 SEC 制药库，成功纳入 {len(valid_assets)} 家高潜标的。"
    print(f"🎉 {summary}")
    send_alert("BioQuantix 扩容完成", summary)

# ==========================================
# 6. 自动化日常主流程 (引入差分过滤优化)
# ==========================================
def main():
    print("🚀 BioQuantix EOD Auto-Update Engine Started (Phase 6 Core)...")
    
    TARGET_SCARCITY_MAP = {}
    try:
        dict_resp = supabase.table('target_dict').select('*').execute()
        TARGET_SCARCITY_MAP = {row['mechanism']: row['score'] for row in dict_resp.data}
    except:
        TARGET_SCARCITY_MAP = {
            "Oral GLP-1 / Dual Agonist": 95, "Auto-CAR-T": 90, 
            "ADC": 85, "FGF21 / MASH Combos": 85, 
            "FcRn Inhibitor": 80, "Standard Oncology": 60 
        }

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
        print(f"\n⏳ 正在处理标的: [{ticker}] {name}")
        
        historical_data = None
        try:
            hist_resp = supabase.table('assets').select('*').eq('ticker', ticker).execute()
            if hist_resp.data and len(hist_resp.data) > 0:
                historical_data = hist_resp.data[0]
        except:
            pass

        clin_data = fetch_clinical_trials(name)
        market_data = fetch_market_data(ticker)
        
        error_logs = []
        sec_warning_flag = None
        
        # 【触发器】: 检查过去14天是否发了财报 (MarketData Earnings API)
        earnings_info = check_earnings_catalyst(ticker)
        
        if market_data["error"]:
            error_logs.append(f"MarketData Error: {market_data['error']}")
            if historical_data and historical_data.get('shadow_signals'):
                market_data["raw_signals"] = historical_data['shadow_signals']
            else:
                market_data["raw_signals"] = [{"type": "SYSTEM", "date": "T-1 EOD", "desc": "Data source feedback delayed.", "mood": "DELAYED"}]

        # 【差分更新核心逻辑】
        if earnings_info["needs_financial_update"] or not historical_data:
            print(f"  -> 检测到财报更新或无历史缓存，触发 SEC 深度抓取...")
            fin_data, sec_error_detail = fetch_financials_dual_layer(ticker)
            
            if fin_data is None:
                sec_warning_flag = 'SEC_MISSING' 
                error_logs.append(f"Financials Error: {sec_error_detail}")
                c_score = historical_data['cash_score'] if historical_data and historical_data.get('cash_score') else 50.0
            else:
                c_score = fin_data["c_score"]
        else:
            print(f"  -> 财报未处于披露期，跳过 SEC 爬取，直接复用历史财务缓存...")
            c_score = historical_data['cash_score'] if historical_data and historical_data.get('cash_score') else 50.0
            fin_data = {"cash": 1, "runway": 1} # 虚拟占位，保证下面 v_score 如果需重算时不报错
        
        t_score = TARGET_SCARCITY_MAP.get(mechanism, 60.0)
        
        # V_score 连续性衰减公式
        v_score = 50.0
        # 如果财务更新了，或者市值变动了，重算估值洼地得分
        if fin_data and market_data["market_cap"] > 0 and fin_data.get("cash", 0) > 0:
            # 取真实的或者昨天历史的 cash 记录进行动态重算
            historic_cash = historical_data.get('raw_cash') if historical_data else 0
            calc_cash = fin_data.get("cash") if fin_data.get("cash") > 1 else historic_cash
            
            if calc_cash and calc_cash > 0:
                p_cash_ratio = market_data["market_cap"] / calc_cash
                v_score = max(10.0, min(100.0, 105.0 - (p_cash_ratio * 10.0)))
            elif historical_data and historical_data.get('valuation_score'):
                v_score = historical_data['valuation_score']
        elif historical_data and historical_data.get('valuation_score'):
            v_score = historical_data['valuation_score']

        days_to_clin = clin_data["days_to_clin"]
        m_score = 50.0
        if days_to_clin <= 0: m_score = 95.0
        elif days_to_clin < 90: m_score = 90.0
        elif days_to_clin < 180: m_score = 75.0
        elif days_to_clin < 365: m_score = 60.0
        
        base_s_score = (c_score * 0.3) + (t_score * 0.4) + (m_score * 0.2) + (v_score * 0.1)
        final_score = base_s_score * 1.15 if market_data["has_anomaly"] else base_s_score
        final_score = round(min(final_score, 99.5), 1) 
        
        min_days = min(days_to_clin, market_data["days_to_opt"]) * 0.8
        if min_days < 30: predicted_time = "14-30 Days (Imminent)"
        elif min_days < 90: predicted_time = "1-3 Months"
        elif min_days < 180: predicted_time = "3-6 Months"
        else: predicted_time = "TBD / Event Driven"

        # 加入未来财报 Catalyst 展示
        if earnings_info["next_earnings_date"] != "TBD":
            predicted_time = f"{predicted_time} (Earnings: {earnings_info['next_earnings_date']})"
        
        v_adj = max(0, (v_score - 50) / 100.0) * 35.0
        t_adj = max(0, (t_score - 50) / 100.0) * 25.0
        prem_val = 40.0 + v_adj + t_adj
        est_premium = f"+{int(prem_val)}% ~ +{int(prem_val + 15)}%"

        print(f"[{ticker}] 计算完毕 | C:{c_score:.1f} T:{t_score:.1f} M:{m_score:.1f} V:{v_score:.1f} | 最终分: {final_score}")

        quant_scores = {
            "c_score": c_score, "t_score": t_score, "m_score": m_score, 
            "v_score": v_score, "final_score": final_score, "est_premium": est_premium
        }
        ai_digest = get_ai_digest(ticker, market_data, clin_data, quant_scores)
        
        if ai_digest.startswith("FAILED_TIMEOUT"):
            sec_warning_flag = 'AI_TIMEOUT' 
            error_logs.append(f"AI Error: {ai_digest}")
            if historical_data and historical_data.get('digest'):
                ai_digest = historical_data['digest']
            else:
                ai_digest = "Data source feedback delayed. Maintaining neutral observation status.\n\nVERDICT: Neutral."
            
        success_count += 1
        error_log_str = " | ".join(error_logs) if error_logs else None 
        
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
        
        if fin_data and fin_data.get("cash", 0) > 1:
            db_record["raw_cash"] = fin_data.get("cash")

        if "deal_info" in target and target["deal_info"]:
             db_record["deal_info"] = target["deal_info"]
        
        try:
            supabase.table('assets').upsert(db_record).execute()
        except Exception as e:
            print(f"❌ {ticker} 写入 assets 失败: {e}")
            
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
    print("🎉 所有医药标的 Phase 6 量化闭环执行结束！")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BioQuantix 数据管理引擎")
    parser.add_argument("--expand", action="store_true", help="执行宇宙扩容: SEC SIC过滤 -> FDA 验证 -> 入库 Watchlist")
    parser.add_argument("--daily", action="store_true", help="执行日常更新: 引入差分控制，避免无效的 SEC 爬取")
    
    args = parser.parse_args()
    
    if args.expand:
        run_universe_expansion()
    else:
        main()
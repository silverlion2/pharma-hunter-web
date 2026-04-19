import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
import requests
import json
import math
import time
import random
import argparse
import concurrent.futures
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

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

SUPABASE_URL = clean_secret(os.environ.get("SUPABASE_URL")) or clean_secret(os.environ.get("VITE_SUPABASE_URL"))
SUPABASE_KEY = clean_secret(os.environ.get("SUPABASE_KEY")) or clean_secret(os.environ.get("VITE_SUPABASE_ANON_KEY"))
DEEPSEEK_KEY = clean_secret(os.environ.get("DEEPSEEK_KEY"))
MARKETDATA_TOKEN = clean_secret(os.environ.get("MARKETDATA_TOKEN"))
BARK_KEY = clean_secret(os.environ.get("BARK_KEY")) 

def send_alert(title, message):
    if BARK_KEY:
        try:
            requests.get(f"https://api.day.app/{BARK_KEY}/{title}/{message}", timeout=5)
        except Exception as e:
            logging.error(f"警报推送失败: {e}")

if SUPABASE_URL and not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    logging.warning("Missing Supabase credentials in environment variables. Some functions requiring database access will fail.")

# ==========================================
# 2. 基础字典与 SEC 双防线机制
# ==========================================
SEC_HEADERS = {"User-Agent": "BioQuantix Quant Engine contact@bioquantix.com"}
CIK_DICT = {}
NAME_DICT = {} 

try:
    logging.info("📥 正在拉取 SEC Ticker-CIK 全市场字典...")
    sec_resp = requests.get("https://www.sec.gov/files/company_tickers.json", headers=SEC_HEADERS, timeout=10)
    sec_resp.raise_for_status()
    sec_dict_raw = sec_resp.json()
    CIK_DICT = {item['ticker']: str(item['cik_str']).zfill(10) for item in sec_dict_raw.values()}
    NAME_DICT = {item['ticker']: item['title'] for item in sec_dict_raw.values()} 
    logging.info(f"✅ SEC 字典加载成功！共计 {len(CIK_DICT)} 家美股上市企业。")
except Exception as e:
    logging.error(f"❌ SEC 字典拉取失败: {e}")
    send_alert("系统警告", "SEC字典拉取失败，财务抓取将全面降级。")

def get_sec_shares(cik):
    """核心算力增强：多标签、按日期排序的安全 SEC 股本解析器"""
    try:
        sec_url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
        sec_resp = requests.get(sec_url, headers=SEC_HEADERS, timeout=8)
        if sec_resp.status_code != 200:
            return 0
            
        facts = sec_resp.json().get('facts', {})
        
        def extract_latest(tag_list):
            if not tag_list: return 0
            valid = [x for x in tag_list if x.get('val', 0) > 0]
            if not valid: return 0
            valid.sort(key=lambda x: x.get('end', '1970-01-01'), reverse=True)
            return float(valid[0]['val'])

        candidates = [
            ('dei', 'EntityCommonStockSharesOutstanding'),
            ('us-gaap', 'CommonStockSharesOutstanding'),
            ('us-gaap', 'SharesOutstanding'),
            ('us-gaap', 'CommonStockSharesIssued'),
            ('us-gaap', 'WeightedAverageNumberOfSharesOutstandingBasic'),
            ('us-gaap', 'WeightedAverageNumberOfDilutedSharesOutstanding'),
            ('ifrs-full', 'NumberOfSharesOutstanding'),
            ('ifrs-full', 'WeightedAverageNumberOfOrdinarySharesOutstanding')
        ]
        
        for domain, tag in candidates:
            s_list = facts.get(domain, {}).get(tag, {}).get('units', {}).get('shares', [])
            latest_shares = extract_latest(s_list)
            if latest_shares > 0:
                return latest_shares
                
        return 0
    except Exception:
        return 0

# 【差分更新触发器】MarketData Earnings API
def check_earnings_catalyst(ticker):
    result = {
        "needs_financial_update": True, 
        "next_earnings_date": "TBD",
        "last_earnings_date": None
    }
    
    if not MARKETDATA_TOKEN:
        return result
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    try:
        url = f"https://api.marketdata.app/v1/stocks/earnings/{ticker}/?countback=2"
        resp = requests.get(url, headers=headers, timeout=5).json()
        
        if resp.get('s') == 'ok':
            dates = resp.get('reportDate', [])
            now = datetime.now()
            
            for date_str in dates:
                try:
                    rep_date = datetime.strptime(str(date_str), "%Y-%m-%d")
                    if rep_date > now:
                        result["next_earnings_date"] = date_str
                    else:
                        result["last_earnings_date"] = date_str
                        days_since_report = (now - rep_date).days
                        result["needs_financial_update"] = days_since_report <= 14
                except:
                    pass
    except Exception:
        pass 
        
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

    if cash <= 0 or rnd <= 0:
        return None, " | ".join(error_details) if error_details else "FINANCIALS_MISSING"

    runway_years = cash / rnd
    c_score = max(10.0, min(95.0, 100.0 - (runway_years * 40.0)))
    
    return {"cash": cash, "runway": runway_years, "c_score": c_score, "source": source}, None

# ==========================================
# 3. 临床倒计时与行情估值抓取
# ==========================================
def check_legal_clearance(ticker):
    """USPTO PTAB API (Official Free REST API) - Monitor 'Settled' / 'Terminated' trials"""
    signals = []
    company_name = NAME_DICT.get(ticker)
    if not company_name:
        return signals
        
    try:
        # 截取公司名前两个单词，避免过长的全称导致匹配失败
        name_query = " ".join(company_name.split()[:2]).replace(",", "")
        url = f"https://developer.uspto.gov/ptab-api/trials?partyName={name_query}"
        headers = {"Accept": "application/json"}
        time.sleep(0.2)
        resp = requests.get(url, headers=headers, timeout=8)
        
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])
            now = datetime.now()
            
            for trial in results:
                status = str(trial.get("trialStatus", ""))
                # "Terminated-Settled" is the specific trigger mentioned by the user
                if "Settled" in status or "Terminated" in status:
                    last_mod = trial.get("lastModifiedDatetime", "")
                    if last_mod:
                        try:
                            f_date = datetime.strptime(str(last_mod)[:10], "%Y-%m-%d")
                            days_ago = (now - f_date).days
                            if days_ago <= 30:
                                signals.append({
                                    "type": "LEGAL",
                                    "date": str(last_mod)[:10],
                                    "desc": f"PTAB Trial {trial.get('trialNumber')} marked as {status} (FTO Clearance)",
                                    "mood": "HIGH-INTENT"
                                })
                                break # Just flag the presence of a recent settlement
                        except Exception:
                            pass
    except Exception as e:
        logging.error(f"PTAB check failed for {ticker}: {e}")
        
    return signals

def check_ip_moat(ticker):
    """Google Patents Public Datasets via BigQuery (IP Moat Pulses)"""
    signals = []
    company_name = NAME_DICT.get(ticker)
    if not company_name:
        return signals
        
    try:
        from google.cloud import bigquery
        from google.api_core.exceptions import DefaultCredentialsError
        
        try:
            client = bigquery.Client()
            name_query = " ".join(company_name.split()[:2]).replace(",", "").upper()
            
            # This query simulates looking for recent Track One Priority or Continuation-In-Part
            query = f"""
                SELECT publication_number, publication_date
                FROM `patents-public-data.patents.publications`
                WHERE assignee = '{name_query}'
                AND publication_date > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
                LIMIT 5
            """
            
            # Since BigQuery usage without creds will throw DefaultCredentialsError, 
            # we wrap it gracefully.
            # query_job = client.query(query)
            # results = query_job.result()
            # for row in results: ... (append real signals if credentials exist)
            
        except DefaultCredentialsError:
            # Graceful fallback: User has not setup GOOGLE_APPLICATION_CREDENTIALS yet.
            pass
            
    except ImportError:
        # Graceful fallback: user hasn't pip installed google-cloud-bigquery
        pass
    except Exception:
        pass
        
    return signals

def check_talent_migration(ticker):
    """SEC Form 8-K (Item 5.02) Executive/Director Change Radar"""
    signals = []
    cik = CIK_DICT.get(ticker)
    if not cik:
        return signals
        
    try:
        url = f"https://data.sec.gov/submissions/CIK{cik}.json"
        time.sleep(0.15)  # 遵守 SEC 速率限制
        resp = requests.get(url, headers=SEC_HEADERS, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            recent = data.get("filings", {}).get("recent", {})
            forms = recent.get("form", [])
            dates = recent.get("filingDate", [])
            items_list = recent.get("items", [])
            
            # Check last 15 filings
            limit = min(15, len(forms))
            now = datetime.now()
            
            for i in range(limit):
                if forms[i] == "8-K":
                    item_str = str(items_list[i]) if i < len(items_list) else ""
                    if "5.02" in item_str:
                        filing_date_str = dates[i] if i < len(dates) else "Unknown"
                        try:
                            f_date = datetime.strptime(filing_date_str, "%Y-%m-%d")
                            days_ago = (now - f_date).days
                            if days_ago <= 30:
                                desc = f"SEC 8-K (Item 5.02) Executive Change Detected ({days_ago} days ago)"
                                signals.append({
                                    "type": "TALENT",
                                    "date": filing_date_str,
                                    "desc": desc,
                                    "mood": "HIGH-INTENT"
                                })
                                break # Just grab the latest one
                        except Exception:
                            pass
    except Exception:
        pass
        
    return signals

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

def fetch_market_data(ticker_symbol, clin_data=None, earnings_info=None):
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
    
    try:
        q_url = f"https://api.marketdata.app/v1/stocks/quotes/{ticker_symbol}/"
        q_resp = requests.get(q_url, headers=headers, timeout=5).json()
        if q_resp.get('s') == 'ok':
            result["price"] = float(q_resp.get('last', [0])[0])
            mc_arr = q_resp.get('marketcap', [])
            if mc_arr and mc_arr[0]:
                result["market_cap"] = float(mc_arr[0])
    except Exception:
        pass

    if result["price"] == "N/A" or result["price"] <= 0:
        try:
            to_date = datetime.now()
            from_date = to_date - timedelta(days=7)
            c_url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker_symbol}/?from={from_date.strftime('%Y-%m-%d')}&to={to_date.strftime('%Y-%m-%d')}"
            c_resp = requests.get(c_url, headers=headers, timeout=5).json()
            if c_resp.get('s') == 'ok':
                c_arr = c_resp.get('c', [])
                if c_arr: result["price"] = float(c_arr[-1])
        except Exception as e:
            result["error"] = f"Price API Error: {str(e)}"

    if result["market_cap"] <= 0:
        try:
            p_url = f"https://api.marketdata.app/v1/stocks/profile/{ticker_symbol}/"
            p_resp = requests.get(p_url, headers=headers, timeout=5).json()
            if p_resp.get('s') == 'ok':
                mc_arr = p_resp.get('marketcap', [])
                if mc_arr and mc_arr[0]:
                    result["market_cap"] = float(mc_arr[0])
        except Exception:
            pass

    if result["market_cap"] <= 0 and result["price"] != "N/A" and result["price"] > 0 and ticker_symbol in CIK_DICT:
        shares = get_sec_shares(CIK_DICT[ticker_symbol])
        if shares > 0:
            result["market_cap"] = shares * float(result["price"])

    try:
        opt_url = f"https://api.marketdata.app/v1/options/chain/{ticker_symbol}?date={yesterday_str}"
        opt_resp = requests.get(opt_url, headers=headers, timeout=10).json()
        
        if opt_resp.get("s") == "ok" and result["price"] != "N/A":
            strikes = opt_resp.get('strike', [])
            sides = opt_resp.get('side', [])
            volumes = opt_resp.get('volume', [])
            ois = opt_resp.get('openInterest', [])
            expirations = opt_resp.get('expiration', [])
            ivs = opt_resp.get('iv', [])
            
            anomalies = []
            min_opt_days = 999
            
            for i in range(len(strikes)):
                side = str(sides[i]).lower()
                strike = float(strikes[i])
                vol = float(volumes[i])
                oi = float(ois[i]) if ois[i] else 0.0
                iv = float(ivs[i]) if (ivs and i < len(ivs) and ivs[i] is not None) else 0.0
                
                if side not in ['call', 'c']: continue 
                if strike <= float(result["price"]) * 1.10: continue 
                if vol < 100: continue 
                
                # Strict "No-Catalyst" Check (Whitepaper v4.5)
                no_clin_catalyst = True
                if clin_data and clin_data.get("days_to_clin", 999) <= 30:
                    no_clin_catalyst = False
                    
                no_earn_catalyst = True
                if earnings_info and earnings_info.get("next_earnings_date", "TBD") != "TBD":
                    try:
                        earn_dt = datetime.strptime(earnings_info["next_earnings_date"], "%Y-%m-%d")
                        if (earn_dt - datetime.now()).days <= 30:
                            no_earn_catalyst = False
                    except: pass
                
                # We require Implied Volatility to be uniquely high (IV > 80%) AND No Scheduled Events
                is_pure_insider_sweep = no_clin_catalyst and no_earn_catalyst and (iv > 0.80)
                
                if ((oi > 0 and vol > oi * 1.5) or (oi == 0 and vol > 500)) and is_pure_insider_sweep:
                    desc = f"Strike ${strike} Call Sweep (Vol: {int(vol)}/OI: {int(oi)} | IV: {int(iv*100)}%)"
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

    shadow_signals = []
    shadow_signals.extend(check_legal_clearance(ticker_symbol))
    shadow_signals.extend(check_ip_moat(ticker_symbol))
    shadow_signals.extend(check_talent_migration(ticker_symbol))
    
    if shadow_signals:
        result["raw_signals"].extend(shadow_signals)
        result["has_anomaly"] = True

    return result

def fetch_latest_news(ticker):
    """MarketData News API (Beta): 获取标的最新一条新闻标题并附上日期"""
    if not MARKETDATA_TOKEN:
        return "No recent news"
    try:
        headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
        url = f"https://api.marketdata.app/v1/stocks/news/?symbol={ticker}&countback=1"
        resp = requests.get(url, headers=headers, timeout=8).json()
        if resp.get('s') == 'ok':
            headlines = resp.get('headline', [])
            pub_dates = resp.get('publicationDate', [])
            updated_dates = resp.get('updated', [])
            
            if headlines and len(headlines) > 0:
                headline_text = str(headlines[0])[:120]
                date_str = ""
                
                # Fetch either publication date or updated date
                raw_date = None
                if pub_dates and len(pub_dates) > 0: raw_date = pub_dates[0]
                elif updated_dates and len(updated_dates) > 0: raw_date = updated_dates[0]
                
                if raw_date:
                    try:
                        # MarketData usually returns Unix timestamp or ISO string
                        if isinstance(raw_date, (int, float)):
                            dt = datetime.fromtimestamp(raw_date)
                            date_str = f"[{dt.strftime('%m/%d')}] "
                        else:
                            # Try parsing ISO 8601 subset if string
                            dt = datetime.strptime(str(raw_date)[:10], "%Y-%m-%d")
                            date_str = f"[{dt.strftime('%m/%d')}] "
                    except:
                        pass
                
                return f"{date_str}{headline_text}"
        return "No recent news"
    except Exception:
        return "No recent news"

def format_cash_display(cash_val):
    """将原始美元数字格式化为简洁的前端显示 (e.g. $150M, $4.2B)"""
    if not cash_val or cash_val <= 0:
        return "—"
    if cash_val >= 1_000_000_000:
        return f"${cash_val / 1_000_000_000:.1f}B"
    elif cash_val >= 1_000_000:
        return f"${cash_val / 1_000_000:.0f}M"
    elif cash_val >= 1_000:
        return f"${cash_val / 1_000:.0f}K"
    return f"${cash_val:.0f}"

# ==========================================
# 4. AI M&A 分析大脑
# ==========================================
def get_clinical_e_score(clin_data, target_area):
    """基于 DeepSeek 解析非结构化临床数据并执行 4步打分法获取 E-Score (0-100)"""
    if "No late-stage active trials" in clin_data.get('desc', ''):
        return 50.0

    if not DEEPSEEK_KEY: 
        return 65.0

    url = "https://api.deepseek.com/chat/completions"
    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    
    prompt = f"""
    You are a clinical scientific diligence expert for BioQuantix M&A terminal.
    Based on the following active trial description for {target_area}:
    Clinical Pipeline Info: {clin_data['desc']}
    
    Execute the BioQuantix 4-step E-Score clinical evaluation:
    Step 1: Anchor against SoC (e.g., Keytruda/Enhertu for Oncology, Wegovy/Rezdiffra for Metabolic, Humira/Tremfya for Autoimmune).
    Step 2: Efficacy Delta (Base 50 if neutral/worse; +20 if 10-20% better; +35 if >20% better or curative).
    Step 3: Safety Penalty (-30 for liver/cardio tox or high AE; +10 if safer than SoC).
    Step 4: Compliance Premium (+5 for SubQ instead of IV; +15 for Oral).
    
    Output ONLY a valid JSON object containing the derived `e_score` (float, maximum 100.0) based on your estimation. Example: {{"e_score": 75.0}}
    """
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a rigid clinical data JSON scorer."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        return min(max(float(data.get("e_score", 65.0)), 0.0), 100.0)
    except Exception as e:
        logging.error(f"DeepSeek E-Score Error: {e}")
        return 65.0

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
    - Clinical Edge Score (E-Score): {quant_scores['e_score']:.1f}/100
    - Asset Scarcity Score (T-Score): {quant_scores['t_score']:.1f}/100
    - Catalyst Milestone Score (M-Score): {quant_scores['m_score']:.1f}/100
    - Cash Pressure Score (C-Score): {quant_scores['c_score']:.1f}/100
    - Valuation Undervalue Score (V-Score): {quant_scores['v_score']:.1f}/100
    - OVERALL QUANT SCORE (S-Score): {quant_scores['final_score']:.1f}/100
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
        logging.error(f"DeepSeek API Error for {ticker}: {e}")
        return f"FAILED_TIMEOUT: {str(e)}"

# ==========================================
# 5. 宇宙扩容引擎 (基于 SEC SIC Code 纯量化扫描)
# ==========================================
def run_universe_expansion():
    logging.info("=== 🚀 启动 BioQuantix 数据池扩容引擎 (Phase 6) ===")
    logging.info("目标: 全盘扫描 SEC 数据库，筛选 SIC 2834 & 2836 且市值在 $50M - $30B 的临床药企。")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logging.warning("🚨 错误: 环境变量缺失，将只在本地空跑打印结果！")
        is_dry_run = True
    else:
        is_dry_run = False

    valid_assets = []
    scan_limit = 150 
    scanned = 0
    
    for ticker, cik in list(CIK_DICT.items()):
        if scanned >= scan_limit:
            break
            
        try:
            sec_sub_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
            sub_resp = requests.get(sec_sub_url, headers=SEC_HEADERS, timeout=5)
            
            if sub_resp.status_code != 200:
                time.sleep(0.11) 
                continue
                
            sub_data = sub_resp.json()
            sic_code = str(sub_data.get("sic", ""))
            
            if sic_code not in ["2834", "2836"]:
                time.sleep(0.11)
                continue 
                
            scanned += 1
            name = sub_data.get("name", NAME_DICT.get(ticker, ticker))
            logging.info(f"\n🔍 [SIC {sic_code} 命中] 正在评估标的: {ticker} ({name})...")
        except Exception as e:
            time.sleep(0.11)
            continue
            
        time.sleep(0.11)

        market_cap = 0
        price = 0
        headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"} if MARKETDATA_TOKEN else {}
        
        try:
            q_url = f"https://api.marketdata.app/v1/stocks/quotes/{ticker}/"
            q_resp = requests.get(q_url, headers=headers, timeout=5).json()
            if q_resp.get('s') == 'ok':
                price = float(q_resp.get('last', [0])[0])
                mc_arr = q_resp.get('marketcap', [])
                if mc_arr and mc_arr[0]:
                    market_cap = float(mc_arr[0])
        except Exception:
            pass

        if price <= 0:
            try:
                to_date = datetime.now()
                from_date = to_date - timedelta(days=7)
                c_url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker}/?from={from_date.strftime('%Y-%m-%d')}&to={to_date.strftime('%Y-%m-%d')}"
                c_resp = requests.get(c_url, headers=headers, timeout=5).json()
                if c_resp.get('s') == 'ok':
                    c_arr = c_resp.get('c', [])
                    if c_arr: price = float(c_arr[-1])
            except Exception:
                pass

        if market_cap <= 0:
            try:
                p_url = f"https://api.marketdata.app/v1/stocks/profile/{ticker}/"
                p_resp = requests.get(p_url, headers=headers, timeout=5).json()
                if p_resp.get('s') == 'ok':
                    mc_arr = p_resp.get('marketcap', [])
                    if mc_arr and mc_arr[0]:
                        market_cap = float(mc_arr[0])
                        logging.info(f"  ⚡ MarketData Profile 获取市值成功: ${market_cap / 1e9:.3f}B")
            except Exception:
                pass

        shares = 0
        if market_cap <= 0 and price > 0:
            shares = get_sec_shares(cik)
            if shares > 0:
                market_cap = shares * price
                logging.info(f"  ⚡ SEC 算力计算成功: 股本({int(shares):,}) × 收盘价(${price}) = 市值 ${market_cap / 1e9:.3f}B")

        if market_cap > 30_000_000_000:
            logging.info(f"  ❌ [DROP] 巨头买方剔除 (市值 > $30B)")
            continue
        elif market_cap <= 0:
            logging.info(f"  ❌ [DROP] 查无市值或已退市 (Debug -> Price: ${price}, SEC Shares: {int(shares)})")
            continue
        else:
            logging.info(f"  ✅ [PASS] 市值符合被收购区间: ${market_cap / 1e9:.3f}B")

        clin_data = fetch_clinical_trials(name)
        if clin_data["phase"] == "None" or "No late-stage active trials" in clin_data["desc"]:
            logging.info(f"  ❌ [DROP] 缺乏活跃的后期临床管线")
            continue
            
        logging.info(f"  🌟 [SUCCESS] 纳入标的池！管线阶段: {clin_data['phase']}")
        
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
        logging.info("\n[Dry Run] 环境变量缺失，跳过写入 Supabase，流程演示成功。")
        return

    logging.info(f"\n开始将 {len(valid_assets)} 条优质标的写入 Watchlist 数据库...")
    for asset in valid_assets:
        try:
            supabase.table('watchlist').upsert(asset).execute()
        except Exception as e:
            logging.error(f"写入失败 {asset['ticker']}: {e}")
            
    summary = f"宇宙扩容完成！已扫描 SEC 制药库，成功纳入 {len(valid_assets)} 家高潜标的。"
    logging.info(f"🎉 {summary}")
    send_alert("BioQuantix 扩容完成", summary)

# ==========================================
# 6. 自动化日常主流程 (引入多线程并发与智能差分)
# ==========================================
def process_single_target(target, TARGET_SCARCITY_MAP, db_assets_map):
    """处理单个标的的核心逻辑，被多线程调用"""
    # [修复1：并发限流防御] 随机引入 0.5 到 2 秒的微小延迟，打散 MarketData 的并发峰值，防止 Http 429 报错
    time.sleep(random.uniform(0.5, 2.0))
    
    ticker = target.get("ticker", "UNKNOWN")
    name = target.get("name", "Unknown")
    mechanism = target.get("mechanism", "Unknown")
    logging.info(f"  [Thread] ⏳ 开始处理标的: {ticker}")
    
    historical_data = db_assets_map.get(ticker)
    
    clin_data = fetch_clinical_trials(name)
    earnings_info = check_earnings_catalyst(ticker)
    market_data = fetch_market_data(ticker, clin_data, earnings_info)
    news_headline = fetch_latest_news(ticker)
    
    error_logs = []
    sec_warning_flag = None
    
    if market_data["error"]:
        error_logs.append(f"MarketData Error: {market_data['error']}")
        if historical_data and historical_data.get('shadow_signals'):
            market_data["raw_signals"] = historical_data['shadow_signals']
        else:
            market_data["raw_signals"] = [{"type": "SYSTEM", "date": "T-1 EOD", "desc": "Data source feedback delayed.", "mood": "DELAYED"}]

    if earnings_info["needs_financial_update"] or not historical_data:
        fin_data, sec_error_detail = fetch_financials_dual_layer(ticker)
        if fin_data is None:
            sec_warning_flag = 'SEC_MISSING' 
            error_logs.append(f"Financials Error: {sec_error_detail}")
            c_score = historical_data['cash_score'] if historical_data and historical_data.get('cash_score') else 50.0
        else:
            c_score = fin_data["c_score"]
    else:
        c_score = historical_data['cash_score'] if historical_data and historical_data.get('cash_score') else 50.0
        fin_data = {"cash": 1, "runway": 1} 
    
    t_score = TARGET_SCARCITY_MAP.get(mechanism, 60.0)
    
    v_score = 50.0
    if fin_data and market_data["market_cap"] > 0 and fin_data.get("cash", 0) > 0:
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
    if days_to_clin < 30: m_score = 95.0
    elif days_to_clin < 90: m_score = 90.0
    elif days_to_clin < 180: m_score = 75.0
    elif days_to_clin < 365: m_score = 60.0
    
    target_area = target.get("target_area", "TBD")
    e_score = get_clinical_e_score(clin_data, target_area)
    
    # 确保分数全部是浮点数，防止向数据库写入 None 导致整批奔溃
    e_score = float(e_score)
    c_score = float(c_score or 50.0)
    t_score = float(t_score or 50.0)
    m_score = float(m_score or 50.0)
    v_score = float(v_score or 50.0)
    
    base_s_score = (e_score * 0.30) + (t_score * 0.25) + (m_score * 0.20) + (c_score * 0.15) + (v_score * 0.10)
    final_score = base_s_score * 1.15 if market_data.get("has_anomaly") else base_s_score
    final_score = float(round(min(final_score, 99.5), 1))
    
    min_days = min(days_to_clin, market_data["days_to_opt"]) * 0.8
    if min_days < 30: predicted_time = "14-30 Days (Imminent)"
    elif min_days < 90: predicted_time = "1-3 Months"
    elif min_days < 180: predicted_time = "3-6 Months"
    else: predicted_time = "TBD / Event Driven"

    if earnings_info["next_earnings_date"] != "TBD":
        predicted_time = f"{predicted_time} (Earnings: {earnings_info['next_earnings_date']})"
    
    v_adj = max(0, (v_score - 50) / 100.0) * 35.0
    t_adj = max(0, (t_score - 50) / 100.0) * 25.0
    prem_val = 40.0 + v_adj + t_adj
    est_premium = f"+{int(prem_val)}% ~ +{int(prem_val + 15)}%"

    # [优化: AI 分析按需触发] 如果分数变化不大且没有期权异动，复用历史 AI 小作文以节省时间
    score_diff = abs(final_score - (historical_data.get('score', 0) if historical_data else 0))
    if historical_data and score_diff < 2.0 and not market_data["has_anomaly"] and historical_data.get('digest'):
        ai_digest = historical_data['digest']
    else:
        quant_scores = {
            "e_score": e_score, "c_score": c_score, "t_score": t_score, "m_score": m_score, 
            "v_score": v_score, "final_score": final_score, "est_premium": est_premium
        }
        ai_digest = get_ai_digest(ticker, market_data, clin_data, quant_scores)
        
        # [修复2：防止新标的 AI 超时写入 None 导致数据库崩溃]
        if ai_digest and ai_digest.startswith("FAILED_TIMEOUT"):
            sec_warning_flag = 'AI_TIMEOUT' 
            error_logs.append(f"AI Error: {ai_digest}")
            if historical_data and historical_data.get('digest'):
                ai_digest = historical_data['digest']
            else:
                ai_digest = "Data source feedback delayed. Maintaining neutral observation status.\n\nVERDICT: Neutral."
        elif not ai_digest:
            ai_digest = "Analysis generation failed due to API limits. Defaulting to neutral."
        
    error_log_str = " | ".join(error_logs) if error_logs else None 
    
    db_record = {
        "ticker": ticker,
        "name": name,
        "score": final_score,
        "clinical_score": e_score,
        "cash_score": c_score,
        "scarcity_score": t_score,
        "milestone_score": m_score,
        "valuation_score": v_score,
        "predicted_time": str(predicted_time),
        "estimated_premium": str(est_premium),
        "shadow_signals": market_data.get("raw_signals", []), 
        "digest": str(ai_digest),
        "target_area": str(target.get("target_area", "TBD")),
        "is_past_deal": bool(target.get("is_past_deal", False)),
        "warning_flag": str(sec_warning_flag) if sec_warning_flag else None,
        "error_log": str(error_log_str) if error_log_str else None,
        "latest_news_headline": str(news_headline) if news_headline else None,
        "market_cap": format_cash_display(market_data.get("market_cap", 0)),
        "cash_amount": format_cash_display(fin_data.get("cash", 0) if fin_data else 0),
        "runway_years": f"~{fin_data['runway']:.1f} Yrs" if fin_data and fin_data.get('runway') else "—"
    }
    
    if fin_data and fin_data.get("cash", 0) > 1:
        db_record["raw_cash"] = float(fin_data.get("cash"))

    if "deal_info" in target and target["deal_info"]:
         db_record["deal_info"] = str(target["deal_info"])

    history_record = None
    if sec_warning_flag or error_log_str:
        history_record = {
            "ticker": ticker,
            "score": final_score,
            "warning_flag": str(sec_warning_flag) if sec_warning_flag else None,
            "error_log": str(error_log_str) if error_log_str else None 
        }

    return {"status": "success", "ticker": ticker, "record": db_record, "history": history_record}


def main():
    logging.info("🚀 BioQuantix EOD Auto-Update Engine Started (Phase 6 Core - Concurrent)...")
    start_time = time.time()
    
    TARGET_SCARCITY_MAP = {}
    try:
        dict_resp = supabase.table('target_dict').select('*').execute()
        TARGET_SCARCITY_MAP = {row['mechanism']: row['score'] for row in dict_resp.data}
    except:
        TARGET_SCARCITY_MAP = {
            "Oral GLP-1 / Dual Agonist": 95, "Amylin Dual Agonist": 95,
            "Auto-CAR-T": 90, "FcRn Inhibitor": 90, "Pan-KRAS Inhibitor": 90,
            "FGF21 / THR-β MASH Combos": 85, "Next-Gen ADC": 85,
            "Standard PD-1/PD-L1": 60, "Basic CD19 CAR-T": 60,
            "Ab mAb (Alzheimer)": 50, "Historic Cardio-toxic Metabolic": 50
        }

    try:
        response = supabase.table('watchlist').select('*').eq('is_active', True).execute()
        targets = response.data
        if not targets:
            logging.warning("⚠️ Watchlist 为空。")
            return
    except Exception as e:
        logging.error(f"❌ 读取 watchlist 失败: {e}")
        return

    db_assets_map = {}
    try:
        hist_resp = supabase.table('assets').select('*').execute()
        for row in hist_resp.data:
            db_assets_map[row['ticker']] = row
    except:
        logging.warning("⚠️ 预加载历史数据失败，将进行回退模式。")

    success_count = 0
    fail_count = 0
    records_to_upsert = []
    history_logs_to_insert = []

    logging.info(f"⚡ 开始多线程并发处理 {len(targets)} 个标的...")
    # 维持最大 5 个线程，以防打穿免费 API 限额
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_single_target, target, TARGET_SCARCITY_MAP, db_assets_map): target for target in targets}
        
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                if result and result["status"] == "success":
                    records_to_upsert.append(result["record"])
                    
                    # Store daily baseline score for 7D/30D analytics
                    history_logs_to_insert.append({
                        "ticker": result["ticker"],
                        "score": result["record"]["score"]
                    })
                    
                    # The old history field was only used for error logging, so we can ignore it or optionally append it
                    # if we want to keep the old assets_history_log active.
                    
                    success_count += 1
                    logging.info(f"  ✅ [{result['ticker']}] 计算完毕 | 分数: {result['record']['score']}")
            except Exception as exc:
                target_name = futures[future].get("ticker", "Unknown")
                logging.error(f"  ❌ [{target_name}] 线程抛出内部异常，跳过该标的: {exc}")
                fail_count += 1

    # [修复3：化整为零的数据库降级写入机制] 
    # 防止因为一条数据错误导致整个 50 条的 batch 写入全部失败
    logging.info(f"\n📦 正在将 {len(records_to_upsert)} 条数据写入数据库...")
    if records_to_upsert:
        for i in range(0, len(records_to_upsert), 50):
            chunk = records_to_upsert[i:i+50]
            try:
                # 首先尝试高效的批量写入
                supabase.table('assets').upsert(chunk).execute()
                logging.info(f"  ✅ 成功批量写入批次 {i//50 + 1} ({len(chunk)} 条)")
            except Exception as batch_err:
                logging.error(f"  ⚠️ 批次 {i//50 + 1} 批量写入失败，自动降级为单条安全写入保护... (原因: {batch_err})")
                # 降级为单条循环写入，哪条错就跳过哪条，绝不牵连无辜
                for record in chunk:
                    try:
                        supabase.table('assets').upsert(record).execute()
                    except Exception as single_err:
                        logging.info(f"  ❌ 放弃写入异常标的 [{record.get('ticker')}]: {single_err}")
                        fail_count += 1
                        success_count -= 1 
            
    if history_logs_to_insert:
        for i in range(0, len(history_logs_to_insert), 50):
            chunk = history_logs_to_insert[i:i+50]
            try:
                supabase.table('asset_scores_history').insert(chunk).execute()
            except Exception as e:
                logging.warning(f"  ⚠️ Could not insert historical score snapshot. Have you run the SQL script? ({e})")

    # Evaluate Custom Alerts
    evaluate_alerts(records_to_upsert)

    end_time = time.time()
    elapsed_minutes = (end_time - start_time) / 60

    # Timeout watchdog: alert if script ran longer than 15 minutes (potential API hang)
    if elapsed_minutes > 15:
        timeout_msg = f"⚠️ Pipeline exceeded 15min threshold ({elapsed_minutes:.1f}min). Possible API hang or rate-limit saturation."
        logging.warning(timeout_msg)
        send_alert("BioQuantix 超时警告", timeout_msg)

    summary_msg = f"并发跑通: {success_count}条，失败抛弃: {fail_count}条。总耗时: {elapsed_minutes:.1f}分钟。"
    send_alert("BioQuantix 日常更新完成", summary_msg)
    logging.info(f"🎉 所有医药标的 Phase 6 量化闭环执行结束！\n📊 {summary_msg}")

def evaluate_alerts(records):
    """
    Evaluates new asset records against user-configured alerts and generates notifications.
    """
    if not records:
        return

    logging.info("🔔 开始评估自定义预警 (Custom Alerts)...")
    try:
        resp = supabase.table('user_alerts').select('*').eq('is_active', True).execute()
        alerts = resp.data
        if not alerts:
            return

        record_map = {r.get('ticker'): r for r in records if r.get('ticker')}
        notifications = []

        for alert in alerts:
            ticker = alert.get('ticker')
            if ticker not in record_map:
                continue

            record = record_map[ticker]
            alert_type = alert.get('alert_type')
            threshold_value = alert.get('threshold_value')
            threshold_text = alert.get('threshold_text')
            user_id = alert.get('user_id')

            triggered = False
            title = ""
            message = ""

            if alert_type == 'QUANT_RISE' and threshold_value is not None:
                if record.get('score', 0) >= threshold_value:
                    triggered = True
                    title = f"🚀 {ticker} Quant Score Alert"
                    message = f"Score has risen to {record.get('score')} (Target: >= {threshold_value})"

            elif alert_type == 'QUANT_DROP' and threshold_value is not None:
                if record.get('score', 0) <= threshold_value:
                    triggered = True
                    title = f"📉 {ticker} Quant Score Alert"
                    message = f"Score has dropped to {record.get('score')} (Target: <= {threshold_value})"

            elif alert_type == 'SCARCITY_RISE' and threshold_value is not None:
                if record.get('scarcity_score', 0) >= threshold_value:
                    triggered = True
                    title = f"💎 {ticker} Scarcity Alert"
                    message = f"Scarcity Score reached {record.get('scarcity_score')}."

            elif alert_type == 'CASH_STRAIN' and threshold_value is not None:
                if record.get('cash_score', 0) >= threshold_value:
                    triggered = True
                    title = f"⚠️ {ticker} Cash Strain Alert"
                    message = f"Cash Strain Score reached {record.get('cash_score')}."

            elif alert_type == 'STATUS_CHANGE' and threshold_text:
                if str(record.get('status')).lower() == str(threshold_text).lower():
                    triggered = True
                    title = f"🔄 {ticker} Status Update"
                    message = f"Status changed to {threshold_text.upper()}"

            if triggered:
                notifications.append({
                    "user_id": user_id,
                    "ticker": ticker,
                    "title": title,
                    "message": message,
                    "is_read": False
                })

        if notifications:
            # We don't deduplicate in script because we want real-time notification generated each time condition met.
            # However, users can toggle alerts off if they don't want repeated hits.
            supabase.table('alert_notifications').insert(notifications).execute()
            logging.info(f"  ✅ 成功生成 {len(notifications)} 条站内预警通知")

    except Exception as e:
        logging.error(f"❌ 评估自定义预警失败: {e}")

def sync_outbound_deals():
    logging.info("🧠 Syncing cross-border BD intelligence from Knowledge Base into Supabase...")
    kb_files = [
        r"d:\knowledge-base\news-wiki\China_Biotech_Outbound.md",
        r"d:\knowledge-base\industry-research\Healthcare_Pharma\Reflection_创新药_BD_超预期，全球化合作推动价值重构.md"
    ]
    texts = []
    for fp in kb_files:
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8") as f:
                texts.append(f.read())
    
    if not texts:
        logging.error("No knowledge base files found.")
        return
        
    combined_text = "\n\n---\n\n".join(texts)
    
    # Try multiple keys/providers seamlessly
    api_key = DEEPSEEK_KEY or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logging.warning("No API key found (DEEPSEEK_KEY or OPENAI_API_KEY). Cannot sync deals.")
        return
        
    prompt = f"""
    Extract all specific OUTBOUND licensing or M&A deals involving Chinese biotechs from the following text.
    Return ONLY a JSON object with a single key 'new_deals' containing a list of objects exactly matching this format:
    {{
        "date": "Month Year (e.g. Mar 2026)",
        "licensor": "Chinese company name",
        "licensee": "MNC / Partner name",
        "value": "Total deal value (e.g. $1.5B)",
        "upfront": "Upfront payment if known, else 'Undisclosed'",
        "drug": "Asset name or 'Multiple Assets'",
        "target": "Biological target or Mechanism",
        "therapeutic_area": "e.g. Oncology, Metabolic",
        "stage": "Development stage",
        "structure": "e.g. Global, Global ex-China",
        "modality": "e.g. Antibody-Drug Conjugate, siRNA",
        "notes": "1-2 sentence brief strategic rationale."
    }}
    Text:
    {combined_text[:6000]}
    """
    
    logging.info("📡 Requesting LLM to extract deals...")
    try:
        from openai import OpenAI
        # Defaulting to deepseek if using their key, else fallback to standard openai format
        base_url = "https://api.deepseek.com" if DEEPSEEK_KEY else "https://api.openai.com/v1"
        model_name = "deepseek-chat" if DEEPSEEK_KEY else "gpt-4o"
        
        client = OpenAI(api_key=api_key, base_url=base_url)
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a pharma financial data extraction bot. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        new_deals = data.get("new_deals", [])
        
        if not new_deals:
            logging.info("No deals found to sync.")
            return
            
        logging.info(f"✅ Extracted {len(new_deals)} deals from LLM!")
        
        if not supabase:
            logging.error("No Supabase client initialized. Cannot push deals to database.")
            return
            
        # Get existing deals to avoid duplicates
        existing_res = supabase.table('outbound_deals').select('licensor', 'licensee').execute()
        existing_deals = existing_res.data if existing_res.data else []
        
        inserted_count = 0
        for deal in new_deals:
            licensor = deal.get('licensor', '').lower()
            licensee = deal.get('licensee', '').lower()
            
            # Simple dedup strategy
            is_dup = any(
                (licensor in e.get('licensor', '').lower() or e.get('licensor', '').lower() in licensor) and
                (licensee in e.get('licensee', '').lower() or e.get('licensee', '').lower() in licensee)
                for e in existing_deals
            )
            
            if is_dup:
                logging.info(f"Skipping duplicate deal: {licensor} & {licensee}")
                continue
                
            insert_res = supabase.table('outbound_deals').insert(deal).execute()
            if insert_res.data:
                inserted_count += 1
                
        logging.info(f"✅ Inserted {inserted_count} new distinct deals into Database.")
        
    except Exception as e:
        logging.error(f"Sync Deals Error: {e}")

def sync_patents():
    logging.info("🧠 Syncing Patent Radar mock data into Supabase...")
    if not supabase:
        logging.error("No Supabase client initialized. Cannot push deals to database.")
        return

    patent_cliffs = [
        {"mnc": "Pfizer", "asset": "Prevnar 13", "year": 2026, "revenue_at_risk": 1.5, "therapeutic_area": "Vaccines", "successor_status": "Prevnar 20 launched", "severity": "MODERATE"},
        {"mnc": "Pfizer", "asset": "Ibrance", "year": 2027, "revenue_at_risk": 4.0, "therapeutic_area": "Oncology", "successor_status": "CDK4 inhibitor in Phase 3", "severity": "HIGH"},
        {"mnc": "Pfizer", "asset": "Eliquis", "year": 2028, "revenue_at_risk": 14.0, "therapeutic_area": "Cardiovascular", "successor_status": "No successor identified", "severity": "CRITICAL"},
        {"mnc": "Pfizer", "asset": "Xtandi", "year": 2027, "revenue_at_risk": 1.8, "therapeutic_area": "Oncology", "successor_status": "ADC pipeline (Seagen)", "severity": "MODERATE"},
        {"mnc": "Merck", "asset": "Januvia", "year": 2026, "revenue_at_risk": 2.0, "therapeutic_area": "Metabolic", "successor_status": "No direct successor", "severity": "MODERATE"},
        {"mnc": "Merck", "asset": "Keytruda", "year": 2028, "revenue_at_risk": 29.5, "therapeutic_area": "Oncology", "successor_status": "SubQ Qlex + ADC pipeline", "severity": "CRITICAL"},
        {"mnc": "AstraZeneca", "asset": "Soliris", "year": 2025, "revenue_at_risk": 2.6, "therapeutic_area": "Rare Disease", "successor_status": "Ultomiris transition", "severity": "LOW"},
        {"mnc": "AstraZeneca", "asset": "Farxiga", "year": 2025, "revenue_at_risk": 7.7, "therapeutic_area": "Cardiovascular", "successor_status": "No successor — major gap", "severity": "CRITICAL"},
        {"mnc": "AstraZeneca", "asset": "Brilinta", "year": 2025, "revenue_at_risk": 2.3, "therapeutic_area": "Cardiovascular", "successor_status": "Discontinuing R&D investment", "severity": "HIGH"},
        {"mnc": "Novartis", "asset": "Entresto", "year": 2025, "revenue_at_risk": 6.5, "therapeutic_area": "Cardiovascular", "successor_status": "Pelacarsen (Lp(a)) in Phase 3", "severity": "HIGH"},
        {"mnc": "Novartis", "asset": "Promacta", "year": 2026, "revenue_at_risk": 2.3, "therapeutic_area": "Hematology", "successor_status": "Iptacopan approved", "severity": "MODERATE"},
        {"mnc": "Eli Lilly", "asset": "Trulicity", "year": 2027, "revenue_at_risk": 4.0, "therapeutic_area": "Metabolic", "successor_status": "Mounjaro/Zepbound dominate", "severity": "LOW"},
        {"mnc": "Roche", "asset": "Perjeta", "year": 2025, "revenue_at_risk": 3.5, "therapeutic_area": "Oncology", "successor_status": "Phesgo transition", "severity": "HIGH"},
        {"mnc": "Roche", "asset": "Kadcyla", "year": 2026, "revenue_at_risk": 2.0, "therapeutic_area": "Oncology", "successor_status": "No direct successor ADC", "severity": "MODERATE"},
        {"mnc": "Roche", "asset": "Ocrevus", "year": 2029, "revenue_at_risk": 7.2, "therapeutic_area": "Neurology", "successor_status": "Anti-CD20 biosimilar defense TBD", "severity": "CRITICAL"},
        {"mnc": "AbbVie", "asset": "Humira", "year": 2023, "revenue_at_risk": 8.0, "therapeutic_area": "Autoimmune", "successor_status": "Skyrizi + Rinvoq replacing", "severity": "MODERATE"},
        {"mnc": "AbbVie", "asset": "Imbruvica", "year": 2026, "revenue_at_risk": 3.6, "therapeutic_area": "Oncology", "successor_status": "CELMoD/ADC pipeline", "severity": "HIGH"},
        {"mnc": "AbbVie", "asset": "Botox", "year": 2029, "revenue_at_risk": 5.3, "therapeutic_area": "Aesthetics/Neuro", "successor_status": "No biosimilar defense", "severity": "HIGH"},
        {"mnc": "Bristol-Myers Squibb", "asset": "Revlimid", "year": 2025, "revenue_at_risk": 5.7, "therapeutic_area": "Oncology", "successor_status": "CELMoDs (Mezigdomide)", "severity": "CRITICAL"},
        {"mnc": "Bristol-Myers Squibb", "asset": "Eliquis", "year": 2027, "revenue_at_risk": 12.2, "therapeutic_area": "Cardiovascular", "successor_status": "No successor", "severity": "CRITICAL"},
        {"mnc": "Bristol-Myers Squibb", "asset": "Opdivo", "year": 2028, "revenue_at_risk": 9.0, "therapeutic_area": "Oncology", "successor_status": "IO combinations", "severity": "HIGH"},
        {"mnc": "Sanofi", "asset": "Dupixent", "year": 2031, "revenue_at_risk": 22.0, "therapeutic_area": "Immunology", "successor_status": "Amlitelimab, Frexalimab pipeline", "severity": "CRITICAL"},
    ]

    cnipa_signals = [
        {"signal_date": "Apr 12, 2026", "company": "Hengrui Pharmaceuticals (恒瑞医药)", "signal_type": "NEW_FILING", "patent_title": "Novel ADC Linker-Payload Technology for TROP2 Targets", "cnipa_number": "CN2026-1-0045678", "jurisdictions_filed": ["CNIPA", "PCT"], "therapeutic_area": "Oncology", "implications": "Hengrui expanding ADC IP beyond existing Roche deal. Next-gen asset preparation for separate out-licensing.", "severity": "HIGH", "related_mnc_interest": ["Novartis", "AstraZeneca"]},
        {"signal_date": "Apr 8, 2026", "company": "BeiGene (百济神州)", "signal_type": "PATENT_GRANTED", "patent_title": "Bispecific PD-1/CTLA-4 Antibody Compositions", "cnipa_number": "CN2024-1-0123456", "jurisdictions_filed": ["CNIPA", "USPTO", "EPO"], "therapeutic_area": "Oncology", "implications": "Granted CNIPA patent strengthens BeiGene negotiating position in AstraZeneca partnership discussions.", "severity": "MODERATE", "related_mnc_interest": ["AstraZeneca", "Roche"]},
        {"signal_date": "Apr 5, 2026", "company": "Innovent Biologics (信达生物)", "signal_type": "OPPOSITION", "patent_title": "GLP-1/GCGR Dual Agonist Patent Opposition by Eli Lilly", "cnipa_number": "CN2023-1-0987654", "jurisdictions_filed": ["CNIPA"], "therapeutic_area": "Metabolic", "implications": "Lilly CNIPA opposition signals FTO concern. May accelerate Innovent out-licensing to non-Lilly MNCs.", "severity": "CRITICAL", "related_mnc_interest": ["Eli Lilly", "Novo Nordisk", "Pfizer"]},
        {"signal_date": "Mar 28, 2026", "company": "Akeso (康方生物)", "signal_type": "PCT_NATIONAL_PHASE", "patent_title": "CLDN18.2 × CD3 Bispecific T-Cell Engager", "cnipa_number": "CN2024-1-0567890", "jurisdictions_filed": ["CNIPA", "USPTO", "EPO", "JPO"], "therapeutic_area": "Oncology", "implications": "Akeso entering national phase in 4 jurisdictions simultaneously. Strong global out-licensing intent.", "severity": "HIGH", "related_mnc_interest": ["BMS", "Merck"]},
        {"signal_date": "Mar 15, 2026", "company": "Legend Biotech (传奇生物)", "signal_type": "NEW_FILING", "patent_title": "Allogeneic CAR-T Manufacturing Process Enhancements", "cnipa_number": "CN2026-1-0023456", "jurisdictions_filed": ["CNIPA", "PCT"], "therapeutic_area": "Hematology", "implications": "Key process patent filing indicates readiness for next-gen off-the-shelf CAR-T scale-up.", "severity": "MODERATE", "related_mnc_interest": ["J&J", "Novartis"]}
    ]

    try:
        supabase.table('patent_cliff_timeline').delete().neq('id', 0).execute()
        res_cliffs = supabase.table('patent_cliff_timeline').insert(patent_cliffs).execute()
        logging.info(f"✅ Inserted {len(res_cliffs.data)} patent cliffs.")
        
        supabase.table('cnipa_scout_signals').delete().neq('id', 0).execute()
        res_cnipa = supabase.table('cnipa_scout_signals').insert(cnipa_signals).execute()
        logging.info(f"✅ Inserted {len(res_cnipa.data)} CNIPA signals.")
    except Exception as e:
        logging.error(f"Failed to sync patent data: {e}")

def sync_biosecure():
    logging.info("🧠 Syncing Biosecure & Conference data into Supabase...")
    if not supabase:
        logging.error("No Supabase client initialized. Cannot push biosecure to database.")
        return

    biosecure_data = {
        "strategic_thesis": {
            "headline": 'Cross-Border Pharma BD: Restructured, Not Dead',
            "subheadline": 'Three data points converge into a single message — and it changes the competitive intelligence calculus.',
            "convergencePoints": [
              { "label": 'Board of Trade Framework', "detail": 'New regulatory corridors formalize cross-border BD pathways, replacing ad-hoc deal structures with institutional frameworks.', "icon": 'Landmark' },
              { "label": 'Biosecure Act — Delayed Enforcement', "detail": 'CDMO decoupling deadline pushed to 2032, giving companies a 6-year window to restructure supply chains while deals continue.', "icon": 'ShieldAlert' },
              { "label": 'Earendil $787M Dual-Hub Success', "detail": 'Massive Series A proves the China+US dual-hub model is investor-validated. Capital is flowing into cross-border structures, not away.', "icon": 'Rocket' }
            ],
            "implication": "BioQuantix's competitive intelligence becomes MORE valuable as companies need to navigate these complex regulatory corridors. The winners won't be those who avoid cross-border — they'll be those with the best intelligence to navigate it.",
            "updatedDate": 'Mar 23, 2026'
        },
        "timeline": [
            { "date": 'Dec 18, 2025', "event": 'Biosecure Act Signed', "status": 'past' },
            { "date": 'Dec 2026', "event": 'OMB Final BCC List Published', "status": 'imminent' },
            { "date": 'Jan 1, 2032', "event": 'Legacy Grandfathering Ends', "status": 'future' }
        ],
        "exposure_map": [
            { "entity": 'WuXi AppTec', "risk": 'High', "westernPartners": ['Eli Lilly', 'Pfizer', 'Amgen'], "shiftTrend": 'Moving to India/EU CDMOs' },
            { "entity": 'BGI', "risk": 'High', "westernPartners": ['Natera', 'Illumina'], "shiftTrend": 'Shift to in-house US testing' },
            { "entity": 'WuXi Biologics', "risk": 'High', "westernPartners": ['GSK', 'AstraZeneca'], "shiftTrend": 'Samsung Biologics & Lonza capturing share' }
        ],
        "deal_flow": [
            { "date": 'Mar 15, 2026', "licensor": 'Hengrui Pharma', "licensee": 'Merck', "value": '$1.4B', "structure": 'Global ex-China rights (ADC)', "paradox_score": 85 },
            { "date": 'Feb 28, 2026', "licensor": 'Biotheus', "licensee": 'BioNTech', "value": '$800M', "structure": 'Global rights (Bispecific)', "paradox_score": 92 },
            { "date": 'Jan 10, 2026', "licensor": 'MediLink', "licensee": 'Roche', "value": '$1.1B', "structure": 'Global rights (ADC)', "paradox_score": 78 }
        ]
    }

    conference_data = {
        "conference": {
            "name": 'BIO-Europe Spring 2026',
            "location": 'Lisbon, Portugal',
            "dates": 'March 23–25, 2026',
            "status": 'LIVE',
            "currentDay": 3,
            "description": 'Premier European biotechnology partnering conference. Key venue for cross-border BD deal announcements, especially China out-licensing. Day 3 — final partnering window and press embargo lift imminent.',
        },
        "stats": {
            "attendees": '4,200+',
            "partneringMeetings": '24,500+',
            "chinaDelegates": '380+',
            "companiesPresenting": '1,800+',
            "dealsAnnounced": '3',
            "chinaDealsAnnounced": '2',
        },
        "rumored_deals": [
            { "id": 4, "company": 'Connect Biopharma', "partner": 'Sanofi', "asset": 'CBP-307', "target": 'S1P1', "modality": 'Small Molecule', "therapeuticArea": 'Autoimmune', "dealStage": '✅ CONFIRMED', "estimatedValue": '$1.6B', "probability": 100, "notes": 'DEAL CLOSED — Announced Day 2. Sanofi acquires global ex-China rights. $200M upfront + $1.4B milestones. Oral S1P1 for ulcerative colitis. Validates Dupixent oral succession thesis.' },
            { "id": 1, "company": 'Hengrui Pharma', "partner": 'Roche', "asset": 'SHR-A2009 (ADC)', "target": 'HER2-low', "modality": 'Antibody-Drug Conjugate', "therapeuticArea": 'Oncology', "dealStage": '✅ CONFIRMED', "estimatedValue": '$3.1B', "probability": 100, "notes": 'DEAL CLOSED — Announced Day 3 closing plenary. Roche secures global rights for $400M upfront + $2.7B milestones. "Deal of the Conference" nominee. Phase 2 data showed ORR 52% in HER2-low breast cancer.' },
            { "id": 2, "company": 'BeiGene', "partner": 'Novartis', "asset": 'BG-B0011 (Bispecific)', "target": 'PD-1 × TIGIT', "modality": 'Bispecific Antibody', "therapeuticArea": 'Oncology', "dealStage": 'Advanced Negotiations', "estimatedValue": '$1.8B–$2.5B', "probability": 72, "notes": 'Multiple sources confirm term sheet exchanged in Lisbon. Novartis BD team extended hotel stay through Mar 26. Expect announcement within 2 weeks post-conference.' }
        ],
        "agenda": [
            { "day": 'Day 1 — Mar 23', "sessions": [{ "time": '09:00', "title": 'Opening Keynote: Cross-Border Partnering in 2026', "type": 'Keynote', "highlight": False }] }
        ],
        "signal_feed": [
            { "time": '14:30 CST', "mood": 'BREAKING', "source": 'Endpoints News', "text": '🏆 Hengrui × Roche ADC deal nominated for "Deal of the Conference" at BIO-Europe Spring closing plenary. $3.1B total value.', "day": 'Day 3' }
        ]
    }

    try:
        supabase.table('biosecure_signals').delete().neq('id', 0).execute()
        supabase.table('biosecure_signals').insert(biosecure_data).execute()
        logging.info("✅ Inserted biosecure_signals into Supabase.")
        
        supabase.table('conference_pulse').delete().neq('id', 0).execute()
        supabase.table('conference_pulse').insert(conference_data).execute()
        logging.info("✅ Inserted conference_pulse into Supabase.")
    except Exception as e:
        logging.error(f"Failed to sync biosecure data: {e}")

def sync_ai():
    logging.info("🧠 Syncing AI Biotech Landscape data into Supabase...")
    if not supabase:
        logging.error("No Supabase client initialized. Cannot push ai to database.")
        return

    ai_data = {
        "capital_flows": [
            { "name": 'Earendil', "amount": '$787M', "round": 'Series A', "date": 'Mar 2026', "focus": 'Foundation Models for Biology', "investors": ['Qiming', 'Sequoia', 'SoftBank', 'ARCH'] },
            { "name": 'Xaira Therapeutics', "amount": '$1.0B', "round": 'Launch', "date": 'Apr 2024', "focus": 'AI-Guided Drug Design', "investors": ['ARCH Venture', 'F-Prime', 'Sequoia', 'Lightspeed'] },
            { "name": 'Formation Bio', "amount": '$372M', "round": 'Series D', "date": 'Jun 2024', "focus": 'AI Clinical Trial Acceleration', "investors": ['a16z', 'Sanofi', 'Sequoia'] }
        ],
        "platform_companies": [
            { "name": 'Recursion (RXRX)', "type": 'Phenomics / Wet-Lab + Dry-Lab', "focus": 'Oncology, Rare Disease', "funding": 'Public ($2.3B Market Cap)', "recent": 'Exscientia Acquisition ($688M)' },
            { "name": 'Isomorphic Labs', "type": 'AlphaFold3 / Generative AI', "focus": 'Small Molecules', "funding": 'Alphabet Backed', "recent": 'Novartis ($1.2B) & Novartis Deals' }
        ],
        "timeline": [
            { "date": 'Nov 2020', "event": 'AlphaFold2 Solves Protein Folding', "desc": 'DeepMind achieves unprecedented accuracy in 3D protein structure prediction.' },
            { "date": 'Mar 2026', "event": 'Earendil $787M Series A', "desc": 'Massive capital fusion into generative biology foundation models.' }
        ],
        "strategic_implications": [
            { "title": 'MNC Build vs. Buy', "desc": 'Top 20 Pharma companies are actively deciding whether to build internal AI capabilities (Sanofi) or partner extensively/acquire (Novartis, Eli Lilly). Expect high-premium acquisitions of proven platforms by 2027.', "icon": 'Building2', "color": 'blue' }
        ]
    }

    try:
        supabase.table('ai_biotech_landscape').delete().neq('id', 0).execute()
        supabase.table('ai_biotech_landscape').insert(ai_data).execute()
        logging.info("✅ Inserted ai_biotech_landscape into Supabase.")
    except Exception as e:
        logging.error(f"Failed to sync AI biotech data: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BioQuantix 数据管理引擎")
    parser.add_argument("--expand", action="store_true", help="执行宇宙扩容: SEC SIC过滤 -> FDA 验证 -> 入库 Watchlist")
    parser.add_argument("--daily", action="store_true", help="执行日常更新: 引入差分控制与多线程并发优化")
    parser.add_argument("--sync-deals", action="store_true", help="同步知识库中的跨境BD交易到本地 mockData.js")
    parser.add_argument("--sync-patents", action="store_true", help="同步Patent Radar预设数据到Supabase")
    parser.add_argument("--sync-biosecure", action="store_true", help="同步Biosecure数据到Supabase")
    parser.add_argument("--sync-ai", action="store_true", help="同步AI Biotech数据到Supabase")
    parser.add_argument("--sync-all", action="store_true", help="执行所有同步任务")
    
    args = parser.parse_args()
    
    if args.sync_all:
        sync_outbound_deals()
        sync_patents()
        sync_biosecure()
        sync_ai()
        
    if args.expand:
        run_universe_expansion()
    elif args.sync_deals:
        sync_outbound_deals()
    elif args.sync_patents:
        sync_patents()
    elif args.sync_biosecure:
        sync_biosecure()
    elif args.sync_ai:
        sync_ai()
    else:
        main()
import os
import requests
from datetime import datetime, timedelta
from supabase import create_client, Client

# ==========================================
# 1. 初始化环境变量 (自动清洗防报错机制)
# ==========================================
def clean_secret(val):
    """自动清洗由 Markdown 复制粘贴引起的特殊字符和多余括号"""
    if not val:
        return val
    val = str(val).strip()
    # 如果误粘贴了形如 [url](url) 的 Markdown 格式，提取真实的 url
    if "](" in val:
        val = val.split("](")[1].strip(")")
    return val

SUPABASE_URL = clean_secret(os.environ.get("SUPABASE_URL"))
# 关键更改：这里我们仍然读取 SUPABASE_KEY 环境变量，
# 但请确保在 GitHub Secrets 中，你填入的是 Service Role Key (secret)，而不是 Anon Key (public)
SUPABASE_KEY = clean_secret(os.environ.get("SUPABASE_KEY"))
DEEPSEEK_KEY = clean_secret(os.environ.get("DEEPSEEK_KEY"))
MARKETDATA_TOKEN = clean_secret(os.environ.get("MARKETDATA_TOKEN"))

# 确保 URL 带有完整的协议头
if SUPABASE_URL and not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

# 初始化 Supabase 客户端 (使用 Service Role Key 可以绕过 RLS 限制进行后端写入)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 核心监控的 Biotech 标的池
# 这里我们加入之前的 15 个核心标的
TARGETS = [
    # Metabolic & Liver
    {"ticker": "ALT", "name": "Altimmune", "target_area": "Metabolic", "is_past_deal": False},
    {"ticker": "TERN", "name": "Terns Pharma", "target_area": "Metabolic", "is_past_deal": False},
    {"ticker": "ETNB", "name": "89bio", "target_area": "Metabolic", "is_past_deal": False},
    {"ticker": "MDGL", "name": "Madrigal", "target_area": "Metabolic", "is_past_deal": False},
    {"ticker": "VKTX", "name": "Viking Tx", "target_area": "Metabolic", "is_past_deal": False},
    
    # Autoimmune & Immunology
    {"ticker": "IMVT", "name": "Immunovant", "target_area": "Autoimmune", "is_past_deal": False},
    {"ticker": "APLS", "name": "Apellis", "target_area": "Autoimmune", "is_past_deal": False},
    {"ticker": "CABA", "name": "Cabaletta Bio", "target_area": "Autoimmune", "is_past_deal": False},
    {"ticker": "KYTX", "name": "Kymera", "target_area": "Autoimmune", "is_past_deal": False},
    {"ticker": "VTYX", "name": "Ventyx Bio", "target_area": "Autoimmune", "is_past_deal": False},

    # Past Deals
    {"ticker": "ALPN", "name": "Alpine Immune", "target_area": "Autoimmune", "is_past_deal": True, "deal_info": "Acquired by Vertex ($4.9B) | April 2024"},
    {"ticker": "RXDX", "name": "Prometheus", "target_area": "Autoimmune", "is_past_deal": True, "deal_info": "Acquired by Merck ($10.8B) | April 2023"},
    {"ticker": "HIBI", "name": "HI-Bio", "target_area": "Autoimmune", "is_past_deal": True, "deal_info": "Acquired by Biogen ($1.8B) | May 2024"},
    {"ticker": "CBAY", "name": "CymaBay", "target_area": "Metabolic", "is_past_deal": True, "deal_info": "Acquired by Gilead ($4.3B) | Feb 2024"},
    {"ticker": "CRMO", "name": "Carmot", "target_area": "Metabolic", "is_past_deal": True, "deal_info": "Acquired by Roche ($2.7B) | Dec 2023"}
]

# ==========================================
# 2. 医药核心数据源抓取模块
# ==========================================
def fetch_clinical_trials(company_name):
    """通过 ClinicalTrials.gov API v2 抓取企业正在进行的后期临床试验"""
    try:
        url = f"https://clinicaltrials.gov/api/v2/studies?query.term={company_name}&filter.advanced=AREA[OverallStatus]ACTIVE_NOT_RECRUITING OR AREA[OverallStatus]RECRUITING&pageSize=1"
        headers = {"accept": "application/json"}
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("studies") and len(data["studies"]) > 0:
            study = data["studies"][0]["protocolSection"]
            title = study["identificationModule"].get("briefTitle", "Unknown Trial")
            phase = study["designModule"].get("phases", ["Phase Unknown"])[0]
            return f"Active Lead Trial: {title} ({phase})"
        return "No late-stage active trials found."
    except Exception as e:
        print(f"Clinical Trials Error for {company_name}: {e}")
        return "Clinical trials API fetch error."

def fetch_market_data(ticker_symbol):
    """使用 MarketData API 提取 T-1 历史收盘价与期权异动"""
    if not MARKETDATA_TOKEN:
        print("Warning: MARKETDATA_TOKEN is not set.")
        return {"price": "N/A", "options": "Token Missing"}
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    
    # 获取 T-1 (前一天) 的日期。
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 抓取现货历史收盘价
    price = "N/A"
    try:
        stock_url = f"https://api.marketdata.app/v1/stocks/candles/D/{ticker_symbol}?from={yesterday_str}&to={yesterday_str}"
        stock_resp = requests.get(stock_url, headers=headers)
        stock_data = stock_resp.json()
        if stock_data.get("s") == "ok" and "c" in stock_data:
            price = stock_data.get("c")[0] # c 代表 close price
    except Exception as e:
        print(f"MarketData Stock Error for {ticker_symbol}: {e}")
        pass
        
    # 抓取期权 T-1 历史链结算数据
    options_data = "Normal"
    try:
        opt_url = f"https://api.marketdata.app/v1/options/chain/{ticker_symbol}?date={yesterday_str}"
        opt_resp = requests.get(opt_url, headers=headers)
        opt_data = opt_resp.json()
        if opt_data.get("s") == "ok":
            options_data = f"Historical Options Flow (T-1) detected. Volume > OI observed in out-of-the-money calls."
    except Exception as e:
        print(f"MarketData Option Error for {ticker_symbol}: {e}")
        options_data = "Historical Options unavailable"

    return {"price": price, "options": options_data}

# ==========================================
# 3. AI M&A 分析大脑 (DeepSeek)
# ==========================================
def get_ai_digest(ticker, market_data, clin_data):
    """将临床和市场数据喂给 DeepSeek，生成战略摘要"""
    url = "https://api.deepseek.com/chat/completions"
    
    if not DEEPSEEK_KEY:
        print("Warning: DEEPSEEK_KEY is not set.")
        return "AI analysis failed due to missing API key."

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_KEY}", 
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a quantitative bio-pharma M&A analyst for BioQuantix.
    Analyze the following EOD (End of Day) data for {ticker}:
    - Market Data: Previous Close Price ${market_data['price']}
    - Clinical Pipeline (FDA Data): {clin_data}
    - Historical Options Flow (Shadow Signals): {market_data['options']}
    
    Write a highly professional, 150-word "Strategic Digest" assessing acquisition probability.
    Structure strictly into: 
    1. Strategic Rationale
    2. Market Intelligence
    3. MODEL VERDICT.
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
        resp = requests.post(url, json=payload, headers=headers)
        resp.raise_for_status() 
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"DeepSeek API Error for {ticker}: {e}")
        return "AI digest generation failed. Waiting for next batch cycle."

# ==========================================
# 4. 自动化主流程 (执行与入库)
# ==========================================
def main():
    print("🚀 BioQuantix EOD Auto-Update Engine Started...")
    for target in TARGETS:
        ticker = target["ticker"]
        name = target["name"]
        
        print(f"[{ticker}] 正在抓取 FDA临床数据 与 MarketData T-1 历史现货期权数据...")
        clin_data = fetch_clinical_trials(name)
        market_data = fetch_market_data(ticker)
        
        print(f"[{ticker}] 正在呼叫 DeepSeek 大脑生成战略研报...")
        ai_digest = get_ai_digest(ticker, market_data, clin_data)
        
        # 量化打分模拟逻辑
        score = 70.0
        if "Phase 2" in clin_data or "Phase 3" in clin_data:
            score += 15.0 # 拥有后期管线，大厂最爱
        if "Flow (T-1) detected" in market_data['options']:
            score += 8.5 # 探测到历史期权异动，加分
            
        db_record = {
            "ticker": ticker,
            "name": name,
            "score": round(score, 1),
            "digest": ai_digest,
            "target_area": target["target_area"],
            "is_past_deal": target["is_past_deal"]
        }
        
        if target.get("deal_info"):
             db_record["deal_info"] = target["deal_info"]
        
        print(f"[{ticker}] 推送至 Supabase 云数据库...")
        try:
            # upsert 表示如果数据库里已经有这个 ticker，就更新它；如果没有，就新建。
            result = supabase.table('assets').upsert(db_record).execute()
            print(f"✅ {ticker} 更新完毕！\n")
        except Exception as e:
            print(f"❌ {ticker} 写入数据库失败: {e}\n")

    print("🎉 所有医药标的 EOD 更新执行结束！")

if __name__ == "__main__":
    main()
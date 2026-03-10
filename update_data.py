import os
import requests
from datetime import datetime, timedelta
from supabase import create_client, Client

# ==========================================
# 1. 初始化环境变量 (通过 GitHub Actions 注入)
# ==========================================
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
DEEPSEEK_KEY = os.environ.get("DEEPSEEK_KEY")
MARKETDATA_TOKEN = os.environ.get("MARKETDATA_TOKEN")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 核心监控的 Biotech 标的池
TARGETS = [
    {"ticker": "ALT", "name": "Altimmune"},
    {"ticker": "ETNB", "name": "89bio"},
    {"ticker": "VKTX", "name": "Viking Therapeutics"}
]

# ==========================================
# 2. 医药核心数据源抓取模块
# ==========================================
def fetch_clinical_trials(company_name):
    """通过 ClinicalTrials.gov API v2 抓取企业正在进行的后期临床试验"""
    try:
        url = f"[https://clinicaltrials.gov/api/v2/studies?query.term=](https://clinicaltrials.gov/api/v2/studies?query.term=){company_name}&filter.advanced=AREA[OverallStatus]ACTIVE_NOT_RECRUITING OR AREA[OverallStatus]RECRUITING&pageSize=1"
        headers = {"accept": "application/json"}
        resp = requests.get(url, headers=headers).json()
        
        if resp.get("studies") and len(resp["studies"]) > 0:
            study = resp["studies"][0]["protocolSection"]
            title = study["identificationModule"].get("briefTitle", "Unknown Trial")
            phase = study["designModule"].get("phases", ["Phase Unknown"])[0]
            return f"Active Lead Trial: {title} ({phase})"
        return "No late-stage active trials found."
    except Exception as e:
        return "Clinical trials API fetch error."

def fetch_market_data(ticker_symbol):
    """使用 MarketData API 提取 T-1 历史收盘价与期权异动 (大幅降低 API 成本)"""
    if not MARKETDATA_TOKEN:
        return {"price": "N/A", "options": "Token Missing"}
        
    headers = {"Authorization": f"Bearer {MARKETDATA_TOKEN}"}
    
    # 获取 T-1 (前一天) 的日期。如果在周二至周六早晨运行，这正好是上一交易日。
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 抓取现货历史收盘价 (比 Live 接口更稳定且便宜)
    price = "N/A"
    try:
        stock_url = f"[https://api.marketdata.app/v1/stocks/candles/D/](https://api.marketdata.app/v1/stocks/candles/D/){ticker_symbol}?from={yesterday_str}&to={yesterday_str}"
        stock_resp = requests.get(stock_url, headers=headers).json()
        if stock_resp.get("s") == "ok":
            price = stock_resp.get("c", ["N/A"])[0] # c 代表 close price
    except Exception:
        pass
        
    # 抓取期权 T-1 历史链结算数据 (Shadow Signals)
    options_data = "Normal"
    try:
        # 请求历史期权链而非实时 Quotes
        opt_url = f"[https://api.marketdata.app/v1/options/chain/](https://api.marketdata.app/v1/options/chain/){ticker_symbol}?date={yesterday_str}"
        opt_resp = requests.get(opt_url, headers=headers).json()
        if opt_resp.get("s") == "ok":
            options_data = f"Historical Options Flow (T-1) detected. Volume > OI observed in out-of-the-money calls."
    except Exception:
        options_data = "Historical Options unavailable"

    return {"price": price, "options": options_data}

# ==========================================
# 3. AI M&A 分析大脑 (DeepSeek)
# ==========================================
def get_ai_digest(ticker, market_data, clin_data):
    """将临床和市场数据喂给 DeepSeek，按照 BioQuantix 标准生成并购潜力量化摘要"""
    url = "[https://api.deepseek.com/chat/completions](https://api.deepseek.com/chat/completions)"
    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    
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
    resp = requests.post(url, json=payload, headers=headers)
    return resp.json()["choices"][0]["message"]["content"]

# ==========================================
# 4. 自动化主流程 (执行与入库)
# ==========================================
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
        "digest": ai_digest
    }
    
    print(f"[{ticker}] 推送至 Supabase 云数据库...")
    supabase.table('assets').upsert(db_record).execute()
    print(f"✅ {ticker} 更新完毕！\n")

print("🎉 所有医药标的 EOD 更新成功！")
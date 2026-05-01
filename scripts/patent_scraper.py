import os
import json
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

load_dotenv()

# ==========================================
# 1. Environment & Setup
# ==========================================
def clean_secret(val):
    if not val:
        return val
    return str(val).strip()

SUPABASE_URL = clean_secret(os.environ.get("SUPABASE_URL"))
SUPABASE_KEY = clean_secret(os.environ.get("SUPABASE_KEY"))
DEEPSEEK_KEY = clean_secret(os.environ.get("DEEPSEEK_KEY"))

try:
    from supabase import create_client, Client
    if SUPABASE_URL and SUPABASE_KEY:
        if not SUPABASE_URL.startswith("http"):
            SUPABASE_URL = "https://" + SUPABASE_URL
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
        logging.warning("Missing Supabase credentials. Running in local dry-run mode.")
except ImportError:
    supabase = None
    logging.warning("supabase-py not installed. Running in local dry-run mode.")

# ==========================================
# 2. Patent Intelligence Extraction (PoC)
# ==========================================
def extract_patent_intelligence(company_name, ticker):
    """
    Extracts patent intelligence via DeepSeek API or falls back to PoC logic.
    """
    logging.info(f"🔍 Analyzing Patent Intelligence for: {company_name} ({ticker})")
    
    if DEEPSEEK_KEY:
        try:
            url = "https://api.deepseek.com/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {DEEPSEEK_KEY}"
            }
            sys_prompt = "You are an expert M&A IP analyst. Evaluate the company's patent moat and Freedom to Operate (FTO) risks based on typical biotech SEC 10-K risk factors. Output strictly as a valid JSON object."
            user_prompt = f"Target: {company_name} ({ticker}). Provide a realistic estimate of their patent moat. Output exactly this JSON structure: {{\n  \"ip_score\": <number 0-100>,\n  \"patent_families\": <integer>,\n  \"fto_risk\": <\"LOW\", \"MODERATE\", or \"HIGH\">,\n  \"defensive_strategy\": <string describing primary IP defense>,\n  \"key_patents\": <array of 3 strings, e.g. \"US-1234567-B2 (Composition of Matter)\">\n}}"
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result_json = response.json()
            content = result_json["choices"][0]["message"]["content"]
            
            # Clean possible markdown formatting
            if content.strip().startswith("```"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(content)
            logging.info(f"✅ DeepSeek analysis successful for {ticker}")
            return {
                "ip_score": round(float(data.get("ip_score", 50.0)), 1),
                "patent_families": int(data.get("patent_families", 50)),
                "fto_risk": data.get("fto_risk", "MODERATE"),
                "defensive_strategy": data.get("defensive_strategy", "Pending Continuations"),
                "key_patents": data.get("key_patents", [
                    f"US-{hash(ticker) % 99999 + 10000}-B2 (Composition of Matter)",
                    f"EP-{hash(ticker) % 9999 + 1000}-A1 (Method of Use)"
                ])
            }
        except Exception as e:
            logging.error(f"DeepSeek API failed for {ticker}: {e}. Falling back to deterministic hashing.")
    
    # Fallback / PoC logic
    mock_patent_count = hash(ticker) % 150 + 20
    is_cn_heavy = "Bio" in company_name or hash(ticker) % 2 == 0
    
    # Calculate IP Score (0-100)
    base_ip_score = min(95.0, max(20.0, (mock_patent_count / 150.0) * 100))
    ip_score = round(base_ip_score + (hash(ticker) % 10 - 5), 1)
    
    # Determine FTO Risk
    if ip_score > 75:
        fto_risk = "LOW"
    elif ip_score > 40:
        fto_risk = "MODERATE"
    else:
        fto_risk = "HIGH"
        
    defensive_strategies = [
        "Patent Thicket", "Pending Continuations", "Method of Use", 
        "Formulation Patents", "Manufacturing Process", "Geographic Moat"
    ]
    defensive_strategy = defensive_strategies[hash(ticker) % len(defensive_strategies)]
    
    # Generate generic key patents representation
    key_patents = [
        f"US-{hash(ticker) % 99999 + 10000}-B2 (Composition of Matter)",
        f"EP-{hash(ticker) % 9999 + 1000}-A1 (Method of Use)",
        f"CN-{hash(ticker) % 99999999 + 10000000}-A ({defensive_strategy})"
    ]
    
    return {
        "ip_score": ip_score,
        "patent_families": mock_patent_count,
        "fto_risk": fto_risk,
        "defensive_strategy": defensive_strategy,
        "key_patents": key_patents
    }

# ==========================================
# 3. Main Data Pipeline Runner
# ==========================================
def run_patent_pipeline():
    logging.info("🚀 Starting Patent Radar Data Pipeline PoC...")
    
    # Targets to process
    targets = [
        {"ticker": "VKTX", "name": "Viking Therapeutics"},
        {"ticker": "RXDX", "name": "Prometheus Biosciences"},
        {"ticker": "KURA", "name": "Kura Oncology"},
        {"ticker": "MRSS", "name": "Merus N.V."},
        {"ticker": "AKRO", "name": "Akero Therapeutics"}
    ]
    
    results = []
    for target in targets:
        intel = extract_patent_intelligence(target["name"], target["ticker"])
        
        # Merge target info with intellectual property context
        target_intel = {
            "ticker": target["ticker"],
            "name": target["name"],
            **intel,
            "last_updated": datetime.now().isoformat()
        }
        results.append(target_intel)
        
        # Output directly to console to demonstrate the extraction
        logging.info(f"   ► IP Score: {intel['ip_score']}/100 | Families: {intel['patent_families']}")
        logging.info(f"   ► FTO Risk: {intel['fto_risk']} | Strategy: {intel['defensive_strategy']}")
        
        # If connected to database, we would update the assets table here
        if supabase:
            try:
                # Assuming an 'assets' table with these columns
                # supabase.table('assets').update({
                #    "ip_score": intel["ip_score"],
                #    "fto_risk": intel["fto_risk"]
                # }).eq("ticker", target["ticker"]).execute()
                pass
            except Exception as e:
                logging.error(f"Database update failed for {target['ticker']}: {e}")
                
    logging.info(f"✅ Patent Radar Data Pipeline completed. Processed {len(results)} targets.")
    
    # Optionally save to a local JSON cache
    try:
        os.makedirs("data_dumps", exist_ok=True)
        with open("data_dumps/patent_intel_cache.json", "w") as f:
            json.dump(results, f, indent=2)
    except Exception as e:
        logging.error(f"Failed to save local cache: {e}")

if __name__ == "__main__":
    run_patent_pipeline()

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
    Mock/PoC extraction of patent intelligence from global databases 
    (USPTO / EPO / CNIPA) to generate IP Moat metrics for the target.
    """
    logging.info(f"🔍 Analyzing Patent Intelligence for: {company_name} ({ticker})")
    
    # In a production environment, this would hit specific APIs:
    # 1. USPTO PTAB API for litigation tracking
    # 2. Google Patents BigQuery for raw patent volumes
    # 3. CNIPA (China) Open API for geographic coverage
    
    # Simulating data extraction logic based on BioQuantix whitepaper
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

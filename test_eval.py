import os
import sys

# Mock Supabase credentials so the module can load
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["DEEPSEEK_KEY"] = "mock_key"

import update_data

# Mock db_assets_map and target_dict
db_assets_map = {}
TARGET_SCARCITY_MAP = {
    "Oral GLP-1 / Dual Agonist": 95, 
    "Basic CD19 CAR-T": 60,
    "Standard Oncology": 60 
}

target = {
    "ticker": "TEST",
    "name": "Test Pharma",
    "mechanism": "Oral GLP-1 / Dual Agonist",
    "target_area": "Metabolic",
    "is_active": True,
    "is_past_deal": False
}

print("Running process_single_target mock test...")
result = update_data.process_single_target(target, TARGET_SCARCITY_MAP, db_assets_map)

print("\n--- Result ---")
print("Status:", result["status"])
print("Ticker:", result["ticker"])
if result["record"]:
    print("S-Score:", result["record"].get("score"))
    print("E-Score (Efficacy):", result["record"].get("efficacy_score", "not in record schema"))  # E-Score is not in db_record currently, but let's check values used
    print("C-Score (Cash):", result["record"].get("cash_score"))
    print("T-Score (Scarcity):", result["record"].get("scarcity_score"))
    print("M-Score (Milestone):", result["record"].get("milestone_score"))
    print("V-Score (Valuation):", result["record"].get("valuation_score"))
    print("Signals:", result["record"].get("shadow_signals"))
    print("AI Digest:\n", result["record"].get("digest"))
else:
    print("Record generation failed or returned None")

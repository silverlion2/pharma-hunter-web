import os
import sys

# Mock API keys
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["DEEPSEEK_KEY"] = "mock"

import update_data

# Mock CIK_DICT and NAME_DICT
update_data.CIK_DICT["PFE"] = "0000078003"
update_data.NAME_DICT["PFE"] = "Pfizer Inc."

update_data.CIK_DICT["AAPL"] = "0000320193"
update_data.NAME_DICT["AAPL"] = "Apple Inc."

print("Testing USPTO PTAB (Legal Clearance)...")
signals_legal = update_data.check_legal_clearance("PFE")
print("PFE PTAB Signals:", signals_legal)

print("\nTesting BigQuery (IP Moat Pulses)...")
signals_ip = update_data.check_ip_moat("PFE")
print("PFE IP Signals:", signals_ip)

print("\nFinished Alternative Data Integrity Tests.")

import os

# Set mock API keys
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["DEEPSEEK_KEY"] = "mock"

import update_data

# Force populate CIK_DICT for a test target
update_data.CIK_DICT["PFE"] = "0000078003"
update_data.CIK_DICT["AAPL"] = "0000320193"

print("Testing SEC Form 8-K Talent Migration...")
signals = update_data.check_talent_migration("PFE")
print("PFE Signals:", signals)

signals2 = update_data.check_talent_migration("AAPL")
print("AAPL Signals:", signals2)

print("\nFinished Talent Migration Tests.")

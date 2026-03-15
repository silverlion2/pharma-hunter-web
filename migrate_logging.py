import re

with open("update_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add import logging
if "import logging" not in content:
    content = re.sub(
        r'(import os)', 
        r'\1\nimport logging\n\nlogging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")', 
        content, 
        count=1
    )

# Replace ALL print(...) with logging.info(...)
content = re.sub(r'\bprint\((.*)\)', r'logging.info(\1)', content)

# Refine visually flagged logs into proper verbosity levels
content = content.replace('logging.info(f"❌', 'logging.error(f"❌')
content = content.replace('logging.info("❌', 'logging.error("❌')
content = content.replace('logging.info(f"🚨', 'logging.warning(f"🚨')
content = content.replace('logging.info("🚨', 'logging.warning("🚨')
content = content.replace('logging.info(f"⚠️', 'logging.warning(f"⚠️')
content = content.replace('logging.info("⚠️', 'logging.warning("⚠️')

# Catch errors by text pattern
content = re.sub(r'logging\.info\((f?"[^"]*Error.*?")\)', r'logging.error(\1)', content, flags=re.IGNORECASE)
content = re.sub(r'logging\.info\((f?"[^"]*failed.*?")\)', r'logging.error(\1)', content, flags=re.IGNORECASE)
content = re.sub(r'logging\.info\((f?"[^"]*失败.*?")\)', r'logging.error(\1)', content, flags=re.IGNORECASE)

with open("update_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Migration complete!")

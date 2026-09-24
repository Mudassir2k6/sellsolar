import json
import re

DATA_PATH = "src/data/todayPricesData.js"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    code = f.read()

# Verify read
print(f"Loaded {len(code)} characters from {DATA_PATH}")

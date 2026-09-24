import json
import re

with open("scripts/sheet_today.json", "r", encoding="utf-8") as f:
    today_sheet = json.load(f)

with open("scripts/new_solar_items.json", "r", encoding="utf-8") as f:
    new_catalog_items = json.load(f)

with open("src/data/todayPricesData.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Prepare today sheet javascript string
sheet_json_str = json.dumps(today_sheet, indent=6)

new_sheets_code = f"""export const ISLAMABAD_DAILY_SHEETS = {{
  "24-Sep-2026": {sheet_json_str},
  "16-Sep-2026": {sheet_json_str}
}};

// Dynamic date references & aliases
ISLAMABAD_DAILY_SHEETS["24-Sept-2026"] = ISLAMABAD_DAILY_SHEETS["24-Sep-2026"];
ISLAMABAD_DAILY_SHEETS["today"] = ISLAMABAD_DAILY_SHEETS["24-Sep-2026"];
ISLAMABAD_DAILY_SHEETS["yesterday"] = ISLAMABAD_DAILY_SHEETS["24-Sep-2026"];

const todayKey = _currentPkt?.shortDate || "24-Sep-2026";
const yesterdayKey = _currentPkt?.yesterdayShortDate || "23-Sep-2026";

if (!ISLAMABAD_DAILY_SHEETS[todayKey]) {{
  ISLAMABAD_DAILY_SHEETS[todayKey] = {{
    ...ISLAMABAD_DAILY_SHEETS["24-Sep-2026"],
    date: _currentPkt?.todayStr || "24 September 2026",
    label: `${{todayKey}} (Today)`
  }};
}}
if (_currentPkt?.shortDate) {{
  ISLAMABAD_DAILY_SHEETS[_currentPkt.shortDate] = ISLAMABAD_DAILY_SHEETS["today"];
}}
if (_currentPkt?.yesterdayShortDate) {{
  ISLAMABAD_DAILY_SHEETS[_currentPkt.yesterdayShortDate] = ISLAMABAD_DAILY_SHEETS["yesterday"];
}}

export const MARKET_SUMMARY = {{
  "panelsPerWattAvg": "Rs 33.50 – 43.50 / W",
  "panelsAvgRate": "Rs 39.50 / W",
  "invertersAvg": "Rs 44,000 – 1,335,000",
  "invertersAvgDetail": "6kW ~Rs 192k • 10kW ~Rs 355k • GoodWe 15kW HV Rs 625k",
  "batteriesAvg": "Rs 56,500 – 1,100,000",
  "batteriesAvgDetail": "5.12kWh LiFePO4 ~Rs 218k • GoodWe HV 5kWh Rs 255k",
  "panelsTrend": `Verified ready stock prices updated for ${{todayKey}}: Jinko 585W at Rs 39.75, JA Solar at Rs 38.50, GoodWe HV Inverters & Lithium stocks live.`,
  "invertersTrend": "GoodWe HV ET series, Zapher IP66, and Itel Hybrid series in steady supply with delivery bookings active",
  "batteriesTrend": "Lithium LiFePO4 5.12kWh IP20/IP54 series dominating market with 5-year replacement + 10-year service warranties",
  "lastMidnightUpdate": `${{todayKey}} (Islamabad Ready Stock Verified)`,
  "schedule": "Daily verified trade benchmark & ready stock feed",
  "cities": [
    {{ "name": "Rawalpindi / Islamabad", "market": "College Road, I-9 Industrial & Blue Area", "rateStatus": "Verified Ready Stock" }},
    {{ "name": "Lahore", "market": "Hall Road & Brandreth Road", "rateStatus": "Active Trade" }},
    {{ "name": "Karachi", "market": "Regal Chowk & Saddar Electronics", "rateStatus": "Direct Port Rates" }},
    {{ "name": "Faisalabad", "market": "Karkhana Bazaar & Rail Bazaar", "rateStatus": "Industrial Hub" }},
    {{ "name": "Multan", "market": "Bohar Gate & Cantt", "rateStatus": "Growing Demand" }},
    {{ "name": "Peshawar", "market": "Saddar Road & Karkhano", "rateStatus": "Active Trade" }}
  ]
}};
"""

# Replace everything from `export const ISLAMABAD_DAILY_SHEETS = {` up to `export const SOLAR_PRICES_DATA = [`
pattern = re.compile(r'export const ISLAMABAD_DAILY_SHEETS\s*=\s*\{.*?export const SOLAR_PRICES_DATA\s*=\s*\[', re.DOTALL)

if not pattern.search(code):
    print("Error: Could not locate ISLAMABAD_DAILY_SHEETS section!")
    exit(1)

# Format the 44 new catalog items as JS
items_js = "export const SOLAR_PRICES_DATA = [\n"
for item in new_catalog_items:
    items_js += f"  {json.dumps(item, indent=2)},\n"

replacement = new_sheets_code + "\n" + items_js
updated_code = pattern.sub(lambda m: replacement, code)

with open("src/data/todayPricesData.js", "w", encoding="utf-8") as f:
    f.write(updated_code)

print("Successfully updated src/data/todayPricesData.js!")

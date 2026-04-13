import requests
import json
import time

BASE_URL = "https://api.fda.gov/drug/label.json"

def safe_get(data, key):
    if key in data and len(data[key]) > 0:
        return data[key][0]
    return "Not Available"

def extract_side_effects(text):
    if not text or text == "Not Available":
        return ["Not Available"]

    # Simple extraction of common side effects words
    effects = []
    common_effects = [
        "nausea", "vomiting", "headache", "dizziness", "rash",
        "diarrhea", "fatigue", "constipation", "dry mouth", "fever"
    ]

    lower_text = text.lower()
    for effect in common_effects:
        if effect in lower_text:
            effects.append(effect.capitalize())

    if len(effects) < 5:
        effects.extend(["Not Listed"] * (5 - len(effects)))

    return effects[:5]

def fetch_drugs(limit=5000):
    drugs = []
    skip = 0
    batch_size = 100  # openFDA max limit per request

    while len(drugs) < limit:
        params = {
            "limit": batch_size,
            "skip": skip
        }

        print(f"Fetching drugs {skip} to {skip + batch_size}...")

        r = requests.get(BASE_URL, params=params)

        if r.status_code != 200:
            print("API Error:", r.text)
            break

        data = r.json()

        if "results" not in data:
            print("No more results.")
            break

        for item in data["results"]:
            drug_name = safe_get(item, "generic_name")
            brand_name = safe_get(item, "brand_name")

            if drug_name == "Not Available":
                continue

            uses = safe_get(item, "indications_and_usage")
            dosage = safe_get(item, "dosage_and_administration")
            warnings = safe_get(item, "warnings")
            adverse = safe_get(item, "adverse_reactions")

            drug_entry = {
                "name": drug_name,
                "uses": uses,
                "adult_dose": dosage,
                "child_dose": "Check pediatric section / doctor consultation",
                "dosage_form": safe_get(item, "dosage_forms_and_strengths"),
                "warnings": warnings,
                "side_effects": extract_side_effects(adverse),
                "brand_names": [brand_name] if brand_name != "Not Available" else []
            }

            drugs.append(drug_entry)

            if len(drugs) >= limit:
                break

        skip += batch_size
        time.sleep(0.3)  # prevent rate-limit

    return drugs


if __name__ == "__main__":
    dataset = fetch_drugs(5000)

    with open("drugs.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    print("✅ Saved dataset as drugs.json with", len(dataset), "drugs")

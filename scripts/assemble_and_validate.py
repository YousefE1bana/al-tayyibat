# -*- coding: utf-8 -*-
"""
Assembler and pre-insertion validator for Al-Tayyibat full food database expansion.
"""
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

# Import modules
from foods_group_a_d import new_foods as batch_a_d
from foods_group_e_j import foods_e_j as batch_e_j
from foods_group_k_n import foods_k_n as batch_k_n
from foods_group_o_q import foods_o_q as batch_o_q
from foods_group_r_v import foods_r_v as batch_r_v

all_batches = [
    ("A-D", batch_a_d),
    ("E-J", batch_e_j),
    ("K-N", batch_k_n),
    ("O-Q", batch_o_q),
    ("R-V", batch_r_v)
]

# Read existing foods to extract existing IDs and verify categories
content = open('src/data/foods.ts', encoding='utf-8').read()
existing_ids = set(re.findall(r'id:\s*"([^"]+)"', content))
print(f"Loaded {len(existing_ids)} existing food IDs from src/data/foods.ts.")

# Categories & Sources
VALID_CATEGORIES = {
    "starches", "meat", "poultry", "fish", "eggs", "dairy",
    "fats", "vegetables", "legumes", "fruits", "nuts",
    "sweets", "drinks", "condiments", "processed"
}

VALID_SOURCES = {
    "altayebaat-guide", "altayebaat-allowed", "wikipedia-ar",
    "elconsolto-statements", "ammanvoice-analysis", "upei-summary",
    "tayyibat-research-pdf"
}

combined_new_foods = []
seen_ids = set()
seen_slugs = set()
errors = []

for batch_name, batch in all_batches:
    print(f"Processing batch {batch_name}: {len(batch)} items")
    for f in batch:
        fid = f["id"]
        slug = f["slug"]
        if fid in existing_ids:
            errors.append(f"Batch {batch_name}: Food ID '{fid}' already exists in baseline 107!")
        if fid in seen_ids:
            errors.append(f"Batch {batch_name}: Duplicate Food ID '{fid}' within new foods!")
        if slug in seen_slugs:
            errors.append(f"Batch {batch_name}: Duplicate Slug '{slug}' within new foods!")
        seen_ids.add(fid)
        seen_slugs.add(slug)

        if f["categoryId"] not in VALID_CATEGORIES:
            errors.append(f"Food '{fid}': Invalid categoryId '{f['categoryId']}'")

        for sid in f.get("sourceIds", []):
            if sid not in VALID_SOURCES:
                errors.append(f"Food '{fid}': Invalid sourceId '{sid}'")

        for p in f.get("provenance", []):
            if p["sourceId"] not in VALID_SOURCES:
                errors.append(f"Food '{fid}': Invalid provenance sourceId '{p['sourceId']}'")

        combined_new_foods.append(f)

all_valid_ids = existing_ids | seen_ids
print(f"Total new unique foods: {len(combined_new_foods)}")
print(f"Grand total database size: {len(all_valid_ids)}")

# Verify alternatives and relatedFoods cross-references
missing_alternatives = {}
missing_related = {}

for f in combined_new_foods:
    fid = f["id"]
    for alt in f.get("alternatives", []):
        if alt not in all_valid_ids:
            missing_alternatives.setdefault(fid, []).append(alt)
    for rel in f.get("relatedFoods", []):
        if rel not in all_valid_ids:
            missing_related.setdefault(fid, []).append(rel)

if missing_alternatives:
    print("\n[WARNING] Missing alternatives detected:")
    for fid, alts in missing_alternatives.items():
        print(f"  Food '{fid}' references missing alternatives: {alts}")
        errors.append(f"Food '{fid}' missing alternatives: {alts}")

if missing_related:
    print("\n[WARNING] Missing relatedFoods detected:")
    for fid, rels in missing_related.items():
        print(f"  Food '{fid}' references missing relatedFoods: {rels}")
        errors.append(f"Food '{fid}' missing relatedFoods: {rels}")

if errors:
    print(f"\nTotal validation errors: {len(errors)}")
    sys.exit(1)
else:
    print("\nSUCCESS: 0 validation errors! All cross-references, categories, and sources are 100% valid.")

# Status breakdown of new foods
from collections import Counter
status_counts = Counter(f["status"] for f in combined_new_foods)
print("\nNew foods status breakdown:")
for st, cnt in status_counts.items():
    print(f"  {st:15s}: {cnt}")
print(f"  TOTAL          : {len(combined_new_foods)}")

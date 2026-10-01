# -*- coding: utf-8 -*-
"""
Script to format and insert all 294 validated new foods into src/data/foods.ts.
"""
import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

from assemble_and_validate import combined_new_foods

print(f"Preparing to insert {len(combined_new_foods)} foods into src/data/foods.ts...")

# Create backup
shutil.copyfile('src/data/foods.ts', 'src/data/foods.ts.bak')
print("Backup created at src/data/foods.ts.bak")

content = open('src/data/foods.ts', encoding='utf-8').read()

# Verify existing foods length
existing_ids = set(re.findall(r'id:\s*"([^"]+)"', content))
print(f"Existing foods in foods.ts: {len(existing_ids)}")

# Format each food into TypeScript
def format_ts_food(f):
    lines = ["  {"]
    lines.append(f'    id: "{f["id"]}",')
    lines.append(f'    slug: "{f["slug"]}",')
    lines.append(f'    name: "{f["name"]}",')

    # aliases
    aliases_str = ", ".join(f'"{a}"' for a in f["aliases"])
    lines.append(f'    aliases: [{aliases_str}],')

    lines.append(f'    categoryId: "{f["categoryId"]}",')
    lines.append(f'    status: "{f["status"]}",')

    # shortDescription (escape quotes)
    short_desc = f["shortDescription"].replace('"', '\\"')
    lines.append(f'    shortDescription: "{short_desc}",')

    if f.get("explanation"):
        exp = f["explanation"].replace('"', '\\"')
        lines.append(f'    explanation: "{exp}",')

    if f.get("usage"):
        usage = f["usage"].replace('"', '\\"')
        lines.append(f'    usage: "{usage}",')

    if f.get("restrictions"):
        res_str = ", ".join(f'"{r.replace("\"", "\\\"")}"' for r in f["restrictions"])
        lines.append(f'    restrictions: [{res_str}],')

    if f.get("alternatives"):
        alt_str = ", ".join(f'"{a}"' for a in f["alternatives"])
        lines.append(f'    alternatives: [{alt_str}],')

    if f.get("relatedFoods"):
        rel_str = ", ".join(f'"{r}"' for r in f["relatedFoods"])
        lines.append(f'    relatedFoods: [{rel_str}],')

    if f.get("sourceIds"):
        src_map = {
            "altayebaat-guide": "G",
            "altayebaat-allowed": "A",
            "wikipedia-ar": "W",
            "elconsolto-statements": "E",
            "ammanvoice-analysis": "V",
            "upei-summary": "U",
            "tayyibat-research-pdf": '"tayyibat-research-pdf"'
        }
        src_items = [src_map.get(sid, f'"{sid}"') for sid in f["sourceIds"]]
        lines.append(f'    sourceIds: [{", ".join(src_items)}],')

    if f.get("provenance"):
        lines.append('    provenance: [')
        for p in f["provenance"]:
            sid = p["sourceId"]
            sid_val = src_map.get(sid, f'"{sid}"')
            lines.append('      {')
            lines.append(f'        sourceId: {sid_val},')
            if "level" in p:
                lines.append(f'        level: "{p["level"]}",')
            if "section" in p:
                sec = p["section"].replace('"', '\\"')
                lines.append(f'        section: "{sec}",')
            if "note" in p:
                note = p["note"].replace('"', '\\"')
                lines.append(f'        note: "{note}",')
            lines.append('      },')
        lines.append('    ],')

    lines.append("  },")
    return "\n".join(lines)

ts_blocks = [format_ts_food(f) for f in combined_new_foods]
all_new_ts = "\n" + "\n".join(ts_blocks) + "\n"

# Locate the closing bracket of foods array: `\n];\n\nexport const foodsById`
pattern = r'(\n\];\s*\n\s*export const foodsById)'
match = re.search(pattern, content)
if not match:
    raise ValueError("Could not find insertion point `];\nexport const foodsById` in src/data/foods.ts")

insertion_idx = match.start(1)
new_content = content[:insertion_idx] + all_new_ts + content[insertion_idx:]

with open('src/data/foods.ts', 'w', encoding='utf-8') as out:
    out.write(new_content)

print("Successfully written expanded foods into src/data/foods.ts!")

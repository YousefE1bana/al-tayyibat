# -*- coding: utf-8 -*-
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

content = open('src/data/foods.ts', encoding='utf-8').read()
image_vars = open('src/data/images.ts', encoding='utf-8').read()

# Map image variables to their path strings in images.ts
# e.g. rice: "/images/foods/rice.jpg"
image_map = {}
for m in re.finditer(r'(\w+):\s*"([^"]+)"', image_vars):
    image_map[f"images.{m.group(1)}"] = m.group(2)

# Extract foods with images
foods_blocks = re.findall(r'(\{[^{}]+id:\s*"[^"]+"[^{}]+\})', content)

with_images = 0
awaiting_images = 0
broken_declared = 0

for block in re.finditer(r'id:\s*"([^"]+)"[\s\S]*?(?:image:\s*([^,\n]+))?[\s\S]*?\},', content):
    fid = block.group(1)
    img = block.group(2)
    if img:
        img_clean = img.strip()
        with_images += 1
        # resolve path
        file_path = image_map.get(img_clean, img_clean.strip('"'))
        full_path = os.path.join('public', file_path.lstrip('/'))
        if not os.path.exists(full_path):
            print(f"Broken declared image for food '{fid}': {file_path}")
            broken_declared += 1
    else:
        awaiting_images += 1

print(f"Total foods analyzed: {with_images + awaiting_images}")
print(f"Foods with images: {with_images}")
print(f"Foods awaiting images: {awaiting_images}")
print(f"Broken declared images: {broken_declared}")

# Check files under public/images/foods/
food_images = os.listdir('public/images/foods')
print(f"Total existing image files in public/images/foods/: {len(food_images)}")

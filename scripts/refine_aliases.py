# -*- coding: utf-8 -*-
"""
Refine aliases in src/data/foods.ts for exact match ranking.
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

content = open('src/data/foods.ts', encoding='utf-8').read()

# 1. halawa: remove "طحينة" from aliases
content = content.replace(
    'aliases: ["حلاوة", "حلاوة طحينية", "حلاوه", "طحينة"]',
    'aliases: ["حلاوة", "حلاوة طحينية", "حلاوه", "حلاوة سادة"]'
)

# 2. eggplant: remove "مسقعة" from aliases
content = content.replace(
    'aliases: ["بتنجان", "باذنجان", "بدنجان", "بتنجان رومي", "بتنجان عروس", "محشي بتنجان", "مسقعة"]',
    'aliases: ["بتنجان", "باذنجان", "بدنجان", "بتنجان رومي", "بتنجان عروس", "محشي بتنجان"]'
)

# 3. olives: remove "مخلل" from aliases
content = content.replace(
    'aliases: ["زيتون", "مخلل", "الزيتون", "زيتون أخضر", "زيتون أسود"]',
    'aliases: ["زيتون", "الزيتون", "زيتون أخضر", "زيتون أسود"]'
)

# 4. peeled-almonds: add "لوز", "اللوز"
content = re.sub(
    r'(id:\s*"peeled-almonds"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"لوز", "اللوز", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 5. aged-cheddar-cheese: add "شيدر", "الشيدر"
content = re.sub(
    r'(id:\s*"aged-cheddar-cheese"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"شيدر", "الشيدر", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 6. beef-shawarma-plate: add "شاورما", "الشاورما"
content = re.sub(
    r'(id:\s*"beef-shawarma-plate"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"شاورما", "الشاورما", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 7. fresh-tuna: add "تونة", "التونة", "تونا"
content = re.sub(
    r'(id:\s*"fresh-tuna"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"تونة", "التونة", "تونا", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 8. wild-salmon: add "سلمون", "السلمون", "سالمون"
content = re.sub(
    r'(id:\s*"wild-salmon"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"سلمون", "السلمون", "سالمون", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 9. natural-mozzarella: add "موتزاريلا", "الموتزاريلا", "موزاريلا"
content = re.sub(
    r'(id:\s*"natural-mozzarella"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"موتزاريلا", "الموتزاريلا", "موزاريلا", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 10. instant-black-coffee: add "نسكافيه", "النسكافيه"
content = re.sub(
    r'(id:\s*"instant-black-coffee"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"نسكافيه", "النسكافيه", ' + m.group(2) + m.group(3),
    content,
    count=1
)

# 11. mixed-pickles-torshi: add "مخلل", "المخلل"
content = re.sub(
    r'(id:\s*"mixed-pickles-torshi"[\s\S]*?aliases:\s*\[)([^\]]*?)(\])',
    lambda m: m.group(1) + '"مخلل", "المخلل", ' + m.group(2) + m.group(3),
    content,
    count=1
)

with open('src/data/foods.ts', 'w', encoding='utf-8') as out:
    out.write(content)

print("Aliases successfully refined in src/data/foods.ts!")

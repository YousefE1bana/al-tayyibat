import { foods } from "../src/data/foods";
import { searchAll, searchDocs, searchFoods, bestFoodMatch } from "../src/lib/search";

const testQueries = [
  "عيش بلدي",
  "عيش سن",
  "شوفان",
  "فريك",
  "عدس",
  "حمص",
  "لوبيا",
  "ترمس",
  "سبانخ",
  "جرجير",
  "خس",
  "كرنب",
  "قرنبيط",
  "باذنجان",
  "بسلة",
  "فاصوليا",
  "مشروم",
  "كبدة",
  "سجق",
  "بسطرمة",
  "بط",
  "ديك رومي",
  "حمام",
  "سمان",
  "سردين",
  "تونة",
  "سلمون",
  "جمبري",
  "كابوريا",
  "لبن",
  "قريش",
  "رومي",
  "شيدر",
  "موتزاريلا",
  "زيت زيتون",
  "زيت عباد",
  "زيت ذرة",
  "لوز",
  "كاجو",
  "عين جمل",
  "سمسم",
  "شيا",
  "تفاح",
  "خوخ",
  "مشمش",
  "فراولة",
  "مانجو",
  "بطيخ",
  "شمام",
  "يوسفي",
  "أناناس",
  "تمر",
  "يانسون",
  "حلبة",
  "قرفة",
  "زنجبيل",
  "قهوة",
  "نسكافيه",
  "عصير قصب",
  "تمر هندي",
  "خروب",
  "عرقسوس",
  "مسقعة",
  "فتة",
  "مكرونة بشاميل",
  "محشي",
  "شاورما",
  "بيتزا",
  "برجر",
  "كنافة",
  "قطايف",
  "رز بلبن",
  "طحينة",
  "مايونيز",
  "كاتشب",
  "مخلل",
  "اندومي",
  "ناجتس",
  "لانشون"
];

console.log(`Testing ${testQueries.length} real-world Egyptian queries...`);

let failures = 0;

for (const q of testQueries) {
  const results = searchFoods(q, 5);
  if (results.length === 0) {
    console.error(`[FAIL] Query "${q}" returned 0 results!`);
    failures++;
  } else {
    if (new Set(results.map((match) => match.food.id)).size !== results.length) {
      console.error(`[FAIL] Query "${q}" returned duplicate foods.`);
      failures++;
    }
  }
}

// Distinguish important terms from substring collisions and bundled aliases.
const focusedQueries = [
  ["رز", "basmati-rice"],
  ["الرز", "basmati-rice"],
  ["أَرْز", "basmati-rice"],
  ["  أرز   بسمتي  ", "basmati-rice"],
  ["بطاطس", "potatoes"],
  ["بَطَاطِس", "potatoes"],
  ["زبدة", "butter"],
  ["زبده", "butter"],
  ["السكر", "sugar"],
  ["شوفان", "oats"],
  ["عدس أصفر", "yellow-lentils"],
  ["لبن", "milk"],
  ["كابوريا", "crab"],
  ["زيت ذرة", "corn-oil"],
  ["مانجو", "mango"],
  ["رز بلبن", "rice-pudding"],
] as const;

for (const [query, expectedId] of focusedQueries) {
  const result = bestFoodMatch(query);
  if (result?.food.id !== expectedId) {
    console.error(`[FAIL] "${query}": expected confident answer ${expectedId}, received ${result?.food.id ?? "none"}.`);
    failures++;
  }
}

// Every catalog title must retrieve its own card, even when aliases overlap.
for (const food of foods) {
  if (!searchFoods(food.name, foods.length).some((match) => match.food.id === food.id)) {
    console.error(`[FAIL] Food title cannot retrieve its own record: ${food.id}.`);
    failures++;
  }
}

// Global search must retain each content type and its original destination.
for (const type of ["food", "category", "principle", "recipe", "faq", "article"] as const) {
  const document = searchDocs.find((entry) => entry.type === type);
  if (!document || !searchAll(document.title, searchDocs.length).some((result) =>
    result.type === type && result.id === document.id && result.href === document.href)) {
    console.error(`[FAIL] Global search cannot retrieve its ${type} document.`);
    failures++;
  }
}

for (const query of ["", "   ", "???", "zzzxqv987654321"]) {
  if (bestFoodMatch(query) !== undefined) {
    console.error(`[FAIL] Unmatched query "${query}" received a confident food answer.`);
    failures++;
  }
}
if (searchFoods("رز", 2).length !== 2 || searchAll("أرز", 2).length !== 2) {
  console.error("[FAIL] Search result limits were not respected.");
  failures++;
}

console.log(`Checked ${testQueries.length} Egyptian queries, ${focusedQueries.length} ranked/normalized answers, ${foods.length} catalog titles, 6 global content types, empty/unmatched queries and result limits.`);
console.log(`Failed: ${failures}`);

if (failures > 0) {
  process.exit(1);
}

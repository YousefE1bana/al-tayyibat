import type { Article, ShoppingGroup, Step } from "@/types";


/** Editorial navigation steps, not a dietary schedule attributed to the doctor. */
export const startSteps: Step[] = [
  {
    "id": "week-1",
    "title": "افهم معاني التصنيفات",
    "summary": "ميّز المسموح والمشروط والمختلف عليه وغير الموثق.",
    "details": [
      "التصنيفات تصف النظام، ولا تقرر ملاءمة طعام لحالتك.",
      "غياب التوثيق لا يعني المنع."
    ],
    "sourceIds": []
  },
  {
    "id": "week-2",
    "title": "ابحث عن الصنف المحدد",
    "summary": "ابحث بالاسم أو الاسم المتداول، ثم افتح صفحة الطعام.",
    "details": [
      "لا تعمم حكم فئة غذائية على كل أفرادها.",
      "راجع الأسماء البديلة لتفادي الخلط بين أصناف متشابهة."
    ],
    "sourceIds": []
  },
  {
    "id": "week-3",
    "title": "اقرأ الشروط وحدود التوثيق",
    "summary": "راجع الكمية والتحضير وملاحظة التوثيق قبل الاعتماد على تصنيف.",
    "details": [
      "الطهي أو النقع لا يثبتان استثناء تلقائيًا.",
      "أبقِ المسائل غير المحسومة غير محسومة."
    ],
    "sourceIds": []
  },
  {
    "id": "week-4",
    "title": "احفظ ما تحتاج الرجوع إليه",
    "summary": "استخدم المفضلة وقائمة المشتريات ودليل المطبخ للمراجعة.",
    "details": [
      "المحفوظات وقائمة المشتريات تبقيان على جهازك.",
      "هذه أدوات تنظيم، وليست وصفة علاجية."
    ],
    "sourceIds": []
  },
  {
    "id": "ongoing",
    "title": "راجع الطبيب عند الحاجة",
    "summary": "أي تغيير علاجي أو غذائي لحالة صحية يحتاج مراجعة متخصص.",
    "details": [
      "لا توقف أو تقلل دواء موصوفًا بناء على هذا الدليل."
    ],
    "sourceIds": []
  }
];

/** No verified complete daily meal plan is available. */
export const sampleDay = [{time:"قبل اختيار وجبة",items:["راجع كل مكوّن في دليل الأطعمة.","الوصفات اقتراحات تحريرية وليست وجبات موثقة عن الدكتور.","استثناءات الخضار والبقوليات تحتاج تصريحًا مباشرًا."]}];

/** دليل المشتريات — مبني على فئات قائمة المسموحات. */
export const shoppingGroups: ShoppingGroup[] = [
  {
    id: "essentials",
    title: "الأساسيات الخمسة",
    items: [
      { id: "s-rice", label: "أرز بسمتي", foodId: "basmati-rice" },
      { id: "s-potato", label: "بطاطا / بطاطس", foodId: "potatoes" },
      { id: "s-dates", label: "تمر", foodId: "dates" },
      { id: "s-butter", label: "زبدة طبيعية", foodId: "butter" },
      { id: "s-sugar", label: "سكر", foodId: "sugar" },
    ],
    sourceIds: [],
  },
  {
    id: "protein",
    title: "البروتين",
    items: [
      { id: "s-beef", label: "لحم بقري / جاموسي", foodId: "beef" },
      { id: "s-lamb", label: "لحم ضأن", foodId: "lamb" },
      { id: "s-sardine", label: "سردين", foodId: "sardines" },
      { id: "s-fish", label: "سمك بحري طبيعي", foodId: "sea-fish" },
      { id: "s-pigeon", label: "حمام / سمان", foodId: "pigeon" },
      { id: "s-liver", label: "كبدة (غير الدجاج)", foodId: "liver" },
    ],
    sourceIds: [],
  },
  {
    id: "dairy-fats",
    title: "الأجبان المعتّقة والدهون",
    items: [
      { id: "s-rumi", label: "جبنة رومي / شيدر / جودة / إمنتال", foodId: "aged-cheese" },
      { id: "s-ghee", label: "سمن بلدي", foodId: "ghee" },
      { id: "s-olive-oil", label: "زيت زيتون", foodId: "olive-oil" },
      { id: "s-olives", label: "زيتون", foodId: "olives" },
    ],
    sourceIds: [],
  },
  {
    id: "fruit-sweets",
    title: "الفواكه والحلويات",
    items: [
      { id: "s-grapes", label: "عنب", foodId: "grapes" },
      { id: "s-apple", label: "تفاح (للتقشير)", foodId: "apple" },
      { id: "s-pomegranate", label: "رمان", foodId: "pomegranate" },
      { id: "s-figs", label: "تين", foodId: "figs" },
      { id: "s-honey", label: "عسل نحل", foodId: "honey" },
      { id: "s-halawa", label: "حلاوة طحينية", foodId: "halawa" },
      { id: "s-nuts", label: "مكسرات", foodId: "nuts" },
    ],
    sourceIds: [],
  },
  {
    id: "drinks",
    title: "المشروبات",
    items: [
      { id: "s-green-tea", label: "شاي أخضر", foodId: "green-tea" },
      { id: "s-coffee", label: "بن للقهوة التركية", foodId: "turkish-coffee" },
      { id: "s-thyme", label: "زعتر", foodId: "thyme-tea" },
      { id: "s-toast", label: "توست قمح كامل", foodId: "whole-wheat-toast" },
    ],
    sourceIds: [],
  },
];

/** Featured guide articles = internal sections. */
export const articles: Article[] = [
  { id: "a-principles", title: "مبادئ منسوبة للنظام", summary: "مبادئ متداولة تحتاج تفاصيلها إلى توثيق مباشر.", href: "/about#principles" },
  { id: "a-essentials", title: "الأساسيات الخمسة", summary: "أصناف موسومة كأساسيات في النسخة السابقة؛ نسبتها وكمياتها تحتاج توثيقًا مباشرًا.", href: "/foods?q=الأساسيات" },
  { id: "a-start", title: "خطوات استخدام الدليل", summary: "افهم التصنيف وابحث عن الصنف واقرأ شروطه وحدود توثيقه.", href: "/how-it-works" },
  { id: "a-science", title: "الموقف العلمي والمؤسسي", summary: "ما تقوله نقابة الأطباء ومنظمة الصحة العالمية، وما ردّ به الدكتور.", href: "/about#science" },
  { id: "a-theories", title: "تفسيرات منسوبة للنظام", summary: "نقل الطرح لا يمثل إثباتًا علميًا مستقلًا.", href: "/about#theories" },
  { id: "a-mistakes", title: "تذكيرات عند استخدام الدليل", summary: "راجع الصنف المحدد ولا تفترض استثناءات غير موثقة.", href: "/how-it-works#mistakes" },
];

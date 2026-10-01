import type { Article, ShoppingGroup, Step } from "@/types";

const G = "altayebaat-guide";
const A = "altayebaat-allowed";

/** «ابدأ من هنا» — الخطة الأسبوعية للمبتدئين كما وردت في الدليل الشامل. */
export const startSteps: Step[] = [
  {
    id: "week-1",
    title: "الأسبوع الأول: الأساسيات + الدقيق",
    summary: "تعرّف على الأساسيات الخمسة، ثم امنع الدقيق الأبيض واعتمد الأرز والبطاطا.",
    details: ["اليوم 1–3: تعرّف على الأساسيات الخمسة (أرز، بطاطا، تمر، زبدة، سكر).", "اليوم 4–5: امنع الدقيق الأبيض.", "اليوم 6–7: اعتمد الأرز والبطاطا."],
    sourceIds: [G],
  },
  {
    id: "week-2",
    title: "الأسبوع الثاني: الحليب والألبان",
    summary: "امنع الحليب والزبادي ثم الجبن الأبيض، وجرّب الأجبان المعتّقة.",
    details: ["اليوم 1–3: امنع الحليب والزبادي.", "اليوم 4–5: امنع الجبن الأبيض.", "اليوم 6–7: جرّب الأجبان المعتّقة (رومي، شيدر...)."],
    sourceIds: [G],
  },
  {
    id: "week-3",
    title: "الأسبوع الثالث: الدجاج والبيض",
    summary: "امنع الدجاج والبيض، واعتمد اللحم البقري والسمك مع قاعدة «يوم آه ويوم لأ».",
    details: ["اليوم 1–3: امنع الدجاج والبيض.", "اليوم 4–5: اعتمد اللحم البقري والسمك.", "اليوم 6–7: طبّق قاعدة «يوم آه ويوم لأ»."],
    sourceIds: [G],
  },
  {
    id: "week-4",
    title: "الأسبوع الرابع: الورقيات والبقوليات",
    summary: "امنع الورقيات ثم البقوليات، وراجع التطبيق الكامل.",
    details: ["اليوم 1–3: امنع الورقيات (سبانخ، جرجير، خس).", "اليوم 4–5: امنع البقوليات.", "اليوم 6–7: تطبيق كامل + مراجعة."],
    sourceIds: [G],
  },
  {
    id: "ongoing",
    title: "بعد ذلك: راجع الدليل عند الحاجة",
    summary: "استخدم البحث لأي طعام تشك فيه، وراقب الأخطاء الشائعة.",
    details: [
      "الأخطاء الخمسة الشائعة: الإفراط في النشويات المسموحة، تجاهل «يوم آه ويوم لأ»، شرب كثير من الماء، الانتقال المفاجئ، تجاهل الصيام.",
      "«خطأ في وجبة ≠ نهاية العالم — ارجع للأساسيات في الوجبة التالية».",
    ],
    sourceIds: [G],
  },
];

/** نموذج اليوم الكامل كما ورد في الدليل. */
export const sampleDay = [
  { time: "الفطور", items: ["بطاطا مشوية + زبدة + 2–3 تمرات", "شاي أخضر أو قهوة تركية", "البديل: توست قمح كامل + زبدة + عسل"] },
  { time: "الغداء", items: ["أرز بسمتي + لحم بقري (يوم «آه»)", "كوسا محشية بالأرز", "تحلية: تمر"] },
  { time: "العشاء (خفيف)", items: ["بطاطا مقلية بزيت زيتون", "جبنة رومي + زيتون", "عنب أو تفاح مقشّر"] },
  { time: "المشروبات", items: ["صباحًا: قهوة تركية", "ظهرًا: شاي أخضر", "عند العطش: ماء + ليمون قليل", "مساءً: زعتر مغلي"] },
];

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
    sourceIds: [G, A],
  },
  {
    id: "protein",
    title: "البروتين (ليوم «آه»)",
    items: [
      { id: "s-beef", label: "لحم بقري / جاموسي", foodId: "beef" },
      { id: "s-lamb", label: "لحم ضأن (مرة أسبوعيًا)", foodId: "lamb" },
      { id: "s-sardine", label: "سردين", foodId: "sardines" },
      { id: "s-fish", label: "سمك بحري طبيعي", foodId: "sea-fish" },
      { id: "s-pigeon", label: "حمام / سمان", foodId: "pigeon" },
      { id: "s-liver", label: "كبدة (غير الدجاج)", foodId: "liver" },
    ],
    sourceIds: [A],
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
    sourceIds: [G, A],
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
      { id: "s-nuts", label: "مكسرات (أسبوعيًا)", foodId: "nuts" },
    ],
    sourceIds: [G, A],
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
    sourceIds: [G, A],
  },
];

/** Featured guide articles = internal sections. */
export const articles: Article[] = [
  { id: "a-principles", title: "القواعد الست الذهبية", summary: "الأكل عند الجوع، قاعدة 80%، تبسيط الوجبة، الشرب عند العطش، الصيام، وتناوب البروتين.", href: "/about#principles" },
  { id: "a-essentials", title: "الأساسيات الخمسة", summary: "أرز، بطاطا، تمر، زبدة، سكر — لماذا هي عماد النظام وما حدود كل منها.", href: "/foods?q=الأساسيات" },
  { id: "a-start", title: "خطة الأربعة أسابيع", summary: "كيف تنتقل تدريجيًا دون «الانتقال المفاجئ» الذي يعده الدليل خطأً شائعًا.", href: "/how-it-works" },
  { id: "a-science", title: "الموقف العلمي والمؤسسي", summary: "ما تقوله نقابة الأطباء ومنظمة الصحة العالمية، وما ردّ به الدكتور.", href: "/about#science" },
  { id: "a-theories", title: "النظريات الثلاث وراء النظام", summary: "نظرية الدهون، جرثومة المعدة، والنسيج الخلالي — بوصفها ادعاءات صاحب النظام.", href: "/about#theories" },
  { id: "a-mistakes", title: "أخطاء المبتدئين الخمسة", summary: "الإفراط في النشويات، تجاهل التناوب، كثرة الماء، الانتقال المفاجئ، تجاهل الصيام.", href: "/how-it-works#mistakes" },
];

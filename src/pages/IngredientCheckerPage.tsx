import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motionPresets } from "@/lib/motion";
import { bestFoodMatch, searchFoods } from "@/lib/search";
import type { Food, FoodStatus } from "@/types";
import { cn } from "@/utils/cn";

interface IngredientResult {
  raw: string;
  matchedFood?: Food;
  score?: number;
  matchType?: "exact" | "strong" | "approximate" | "unmatched";
}

const SAMPLE_RECIPES = [
  {
    name: "وجبة غداء طيبات مثالية",
    text: "أرز بسمتي، لحم بقري، سمن بلدي، ملح صخري",
  },
  {
    name: "وجبة شائعة بها ممنوعات",
    text: "خبز بلدي، دجاج مزارع، بطاطس مقلية بزيت ذرة، سلطة خضراء بالخيار والجرجير",
  },
  {
    name: "إفطار كلاسيكي",
    text: "توست قمح كامل، جبن رومي معتق، زبدة طبيعية، 3 تمرات، شاي أخضر",
  },
];

export default function IngredientCheckerPage() {
  usePageMeta("فاحص المكونات", "فاحص المكونات التراكمي — افحص مكونات طبختك أو وجبتك دفعة واحدة في نظام الطيبات.");
  const [inputText, setInputText] = useState(
    "أرز بسمتي، لحم بقري، سمن بلدي، خبز أبيض، طماطم"
  );

  // Parse delimiters: comma, Arabic comma, newline, semicolon, Arabic semicolon, tabs
  const parsedIngredients = useMemo(() => {
    const rawTokens = inputText
      .split(/[,،;؛\n\r\t]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const results: IngredientResult[] = [];
    const seen = new Set<string>();

    for (const token of rawTokens) {
      if (seen.has(token)) continue;
      seen.add(token);

      // Try confident match first
      const confident = bestFoodMatch(token);
      if (confident) {
        results.push({
          raw: token,
          matchedFood: confident.food,
          score: confident.score,
          matchType: confident.score <= 0.05 ? "exact" : "strong",
        });
        continue;
      }

      // Try fuzzy search fallback with threshold 0.42
      const [top] = searchFoods(token, 1);
      if (top && top.score <= 0.42) {
        results.push({
          raw: token,
          matchedFood: top.food,
          score: top.score,
          matchType: "approximate",
        });
      } else {
        results.push({
          raw: token,
          matchType: "unmatched",
        });
      }
    }

    return results;
  }, [inputText]);

  // Status tally
  const counts = useMemo(() => {
    const summary = {
      compatible: 0,
      conditional: 0,
      notRecommended: 0,
      disputed: 0,
      unknown: 0,
      unmatched: 0,
    };

    for (const item of parsedIngredients) {
      if (!item.matchedFood) {
        summary.unmatched += 1;
      } else {
        const s = item.matchedFood.status as FoodStatus;
        if (summary[s] !== undefined) {
          summary[s] += 1;
        }
      }
    }

    return summary;
  }, [parsedIngredients]);

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// فاحص المكونات</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          افحص مكونات <span className="underline decoration-accent decoration-4">وجبتك كاملة</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          الصق قائمة مقادير الوصفة أو مكونات طعامك مفصولة بفواصل أو أسطر جديدة، لنبحث عن كل مكوّن في
          قاعدة بيانات نظام الطيبات. راجع اسم الصنف المقترح، خصوصًا عند ظهور مطابقة قريبة أو تقريبية.
        </p>
      </header>

      {/* Main Input Card */}
      <section className="mt-10 max-w-4xl" aria-label="مدخلات فاحص المكونات">
        <div className="brut bg-surface">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-2 border-line bg-bg-2 px-4 py-2">
            <Terminal className="size-4 shrink-0 text-accent" aria-hidden />
            <span dir="ltr" className="mono min-w-0 break-all text-[11px] text-muted">tayyibat://ingredient-checker</span>
            <span className="mono ms-auto text-[11px] text-muted" role="status">
              {parsedIngredients.length} مكوّن في القائمة
            </span>
          </div>

          <div className="p-4 md:p-6">
            <label htmlFor="ingredients-box" className="mb-2 block text-sm font-bold text-ink">
              اكتب أو الصق المكونات (افصل بينها بفاصلة ، أو سطر جديد):
            </label>
            <textarea
              id="ingredients-box"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="مثال: أرز بسمتي، لحم بقري، سمن بلدي، دجاج، خبز أبيض…"
              className="w-full border-2 border-line bg-bg p-4 font-semibold text-ink placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
            />

            {/* Quick Sample Presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mono text-xs text-muted">أمثلة جاهزة للتجربة:</span>
              {SAMPLE_RECIPES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => setInputText(sample.text)}
                  className="mono min-h-10 border border-line-soft bg-bg px-2.5 py-1 text-xs text-ink-2 transition hover:border-line hover:text-ink cursor-pointer"
                >
                  {sample.name}
                </button>
              ))}
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="mono ms-auto inline-flex min-h-10 items-center gap-1 border border-line-soft px-2 py-1 text-xs text-muted hover:text-status-no cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>مسح</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Analysis & Breakdown */}
      {parsedIngredients.length > 0 && (
        <section className="mt-8 max-w-4xl space-y-6" aria-label="نتائج فحص المكونات">
          {/* Summary stats bar (No fake percentages — pure counts) */}
          <div className="brut bg-surface p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="size-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">حوصلة المكونات المفحوصة</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-ok">
                  <CheckCircle2 className="size-4" />
                  <span>من الطيبات</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.compatible}</div>
              </div>

              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-cond">
                  <AlertTriangle className="size-4" />
                  <span>بشروط / قيود</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.conditional}</div>
              </div>

              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-no">
                  <XCircle className="size-4" />
                  <span>ممنوع في النظام</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.notRecommended}</div>
              </div>

              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-disputed">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden />
                  <span>المصادر مختلفة</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.disputed}</div>
              </div>

              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-unknown">
                  <HelpCircle className="size-4 shrink-0" aria-hidden />
                  <span>غير موثق</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.unknown}</div>
              </div>

              <div className="border-2 border-line bg-bg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <HelpCircle className="size-4" />
                  <span>غير موجود بالدليل</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-ink">{counts.unmatched}</div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted border-t border-line-soft pt-3">
              * تنبيه: هذا الفحص مطابق لمحتوى قاعدة بيانات الدليل فقط، ولا يمثل نسبة مئوية طبية أو حكماً نهائياً
              على صلاحية الوجبة لحالتك الصحية الخاصة.
            </p>
          </div>

          {/* Detailed Item-by-Item List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink">تفصيل كل مكوّن:</h3>
            <div className="space-y-2">
              {parsedIngredients.map((res, idx) => (
                <motion.div
                  key={idx}
                  variants={motionPresets.fadeUp}
                  initial="hidden"
                  animate="show"
                  className={cn(
                    "brut flex flex-col justify-between gap-3 bg-surface p-4 sm:flex-row sm:items-center",
                    !res.matchedFood && "opacity-85 bg-bg-2"
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mono shrink-0 text-xs text-muted mt-0.5">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>

                    <div className="min-w-0 [overflow-wrap:anywhere]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-0 max-w-full text-lg font-bold text-ink">{res.raw}</span>
                        {res.matchedFood && (
                          <span className="text-xs text-muted">
                            ({res.matchType === "exact" ? "الصنف المطابق" : "الصنف المقترح"}: {res.matchedFood.name})
                          </span>
                        )}
                      </div>

                      {res.matchedFood && res.matchType !== "exact" && (
                        <p className="mt-1 text-xs font-semibold text-status-cond">
                          {res.matchType === "approximate" ? "اقتراح تقريبي" : "مطابقة قريبة"} — تحقّق من الصنف قبل اعتماد حالته.
                        </p>
                      )}

                      {res.matchedFood ? (
                        <p className="mt-1 text-xs text-ink-2 max-w-xl leading-relaxed">
                          {res.matchedFood.shortDescription}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted italic">
                          غير موجود في قاعدة بيانات الدليل حتى الآن.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-center">
                    {res.matchedFood ? (
                      <>
                        <FoodStatusBadge status={res.matchedFood.status} size="sm" />
                        <Link
                          to={`/foods/${res.matchedFood.slug}`}
                          className="inline-flex min-h-10 items-center gap-1 border border-line-soft px-2.5 py-1 text-xs font-bold text-ink transition hover:border-accent hover:text-accent"
                        >
                          <span>التفاصيل</span>
                          <ArrowLeft className="size-3" />
                        </Link>
                      </>
                    ) : (
                      <span className="mono border border-line-soft bg-bg px-2 py-1 text-xs text-muted">
                        غير مصنّف
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guide Note */}
      <section className="mt-16 max-w-4xl border-t-2 border-line pt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h4 className="font-bold text-ink">مبدأ دقة المعلومات في الطيبات:</h4>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-2">
          حالات الأطعمة تُعرض كما وردت في مصادر الدليل، بما فيها اختلاف المصادر وغياب التوثيق. البحث قد يقترح
          اسمًا قريبًا مما كتبته؛ راجع الاسم والتفاصيل لتتأكد أنه المكوّن المقصود. عدم العثور على مكوّن لا يعني أنه ممنوع،
          وهذه النتائج لا تمثل نسبة توافق طبية للوجبة.
        </p>
      </section>
    </div>
  );
}

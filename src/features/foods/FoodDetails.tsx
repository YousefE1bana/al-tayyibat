import { ArrowLeftRight, ExternalLink, Info, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import { foodsById } from "@/data/foods";
import type { Food } from "@/types";
import { STATUS_META } from "@/lib/status";
import { SmartImage } from "@/components/ui/SmartImage";
import { FavoriteButton } from "@/features/favorites/FavoriteButton";
import { SourceRefs } from "@/features/sources/SourceReference";
import { FoodStatusBadge } from "./FoodStatusBadge";

interface Props {
  food: Food;
  onNavigate?: (food: Food) => void;
  full?: boolean;
}

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-line-soft py-5 first:border-t-0">
      <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
        <span className="mono text-[11px] text-accent">{code}</span> {title}
      </h3>
      <div className="text-[15px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

function FoodChip({ id, onNavigate }: { id: string; onNavigate?: (f: Food) => void }) {
  const f = foodsById[id];
  if (!f) return null;
  const meta = STATUS_META[f.status];
  const content = (
    <>
      <span className={meta.twText} aria-hidden>
        {meta.symbol}
      </span>
      <span>{f.name}</span>
    </>
  );
  const cls = "inline-flex items-center gap-2 border-2 border-line bg-surface px-3 py-1.5 text-sm font-semibold transition hover:bg-accent hover:text-accent-ink";
  return onNavigate ? (
    <button type="button" onClick={() => onNavigate(f)} className={cls}>
      {content}
    </button>
  ) : (
    <Link to={`/foods/${f.slug}`} className={cls}>
      {content}
    </Link>
  );
}

/** Food details body — used inside the drawer and on the dedicated page. */
export function FoodDetails({ food, onNavigate, full = false }: Props) {
  const category = categoriesById[food.categoryId];
  const meta = STATUS_META[food.status];
  const Heading = full ? "h1" : "h2";

  return (
    <div className={full ? "" : "px-5 pb-8"}>
      <div className={full ? "grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start" : ""}>
        <SmartImage
          src={food.image}
          alt={food.name}
          fallbackLabel={category?.name}
          className={full ? "brut aspect-[4/3] w-full" : "-mx-5 aspect-[16/9] border-b-2 border-line"}
        />
        <div className={full ? "" : "pt-5"}>
          <div className="mono mb-2 text-xs text-muted">
            {category?.name} · #{food.slug}
          </div>
          <Heading className={full ? "text-3xl font-bold md:text-5xl" : "text-2xl font-bold"}>{food.name}</Heading>
          {food.aliases.length > 0 && (
            <p className="mono mt-2 text-xs text-muted">يُعرف أيضًا: {food.aliases.join(" · ")}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <FoodStatusBadge status={food.status} size="lg" variant="solid" />
            <FavoriteButton kind="food" id={food.id} label={food.name} />
            {!full && (
              <Link
                to={`/foods/${food.slug}`}
                className="inline-flex h-11 items-center gap-1.5 border-2 border-line bg-surface px-4 text-sm font-semibold hover:bg-surface-2"
              >
                صفحة كاملة <ExternalLink className="size-4" aria-hidden />
              </Link>
            )}
          </div>
          <p className="mt-4 border-s-2 border-accent ps-3 text-sm leading-relaxed text-muted">
            هذا التصنيف وفقًا لقواعد نظام الطيبات كما تعرضها المصادر، وليس تقييمًا طبيًا لملاءمة الطعام لحالتك الشخصية.
          </p>
          <p className="mt-3 text-sm text-muted">{meta.description}</p>
        </div>
      </div>

      <div className={full ? "mt-10 grid gap-x-12 lg:grid-cols-[1fr_320px]" : "mt-6"}>
        <div>
          <Section title="حالته في النظام" code="01">
            <p className="text-lg font-semibold text-ink">{food.shortDescription}</p>
          </Section>

          {food.explanation && (
            <Section title="لماذا؟" code="02">
              <p>{food.explanation}</p>
            </Section>
          )}

          {food.usage && (
            <Section title="طريقة الاستخدام" code="03">
              <p>{food.usage}</p>
            </Section>
          )}

          {food.restrictions?.length ? (
            <Section title="الكمية / القيود" code="04">
              <ul className="space-y-2">
                {food.restrictions.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mono text-accent">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {food.notes && (
            <Section title="ملاحظات" code="05">
              <p className="flex gap-2 border-2 border-status-cond/60 bg-surface p-3 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-status-cond" aria-hidden />
                <span>{food.notes}</span>
              </p>
            </Section>
          )}
        </div>

        <aside className={full ? "lg:border-s-2 lg:border-line-soft lg:ps-8" : ""}>
          {food.alternatives?.length ? (
            <Section title="بدائل مشابهة" code="06">
              <div className="flex flex-wrap gap-2">
                {food.alternatives.map((id) => (
                  <FoodChip key={id} id={id} onNavigate={onNavigate} />
                ))}
              </div>
              <p className="mono mt-2 flex items-center gap-1 text-[11px] text-muted">
                <ArrowLeftRight className="size-3" /> بدائل مذكورة في المصادر فقط — لا توصية آلية.
              </p>
            </Section>
          ) : null}

          {food.relatedFoods?.length ? (
            <Section title="أطعمة مرتبطة" code="07">
              <div className="flex flex-wrap gap-2">
                {food.relatedFoods.map((id) => (
                  <FoodChip key={id} id={id} onNavigate={onNavigate} />
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="المصدر" code="08">
            {food.sourceIds?.length ? (
              <SourceRefs ids={food.sourceIds} />
            ) : (
              <p className="mono text-xs text-muted">لا يوجد مصدر موثق لهذا الإدخال حتى الآن.</p>
            )}
            <Link to="/sources" className="mono mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline">
              <Link2 className="size-3" /> راجع تقييم موثوقية المصادر
            </Link>
          </Section>
        </aside>
      </div>
    </div>
  );
}

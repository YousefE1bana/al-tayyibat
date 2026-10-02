import { LinkButton } from "@/components/ui/Button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSearch } from "@/features/search/SearchProvider";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  usePageMeta("الصفحة غير موجودة");
  const { openSearch } = useSearch();
  return (
    <div className="container-x flex min-h-[70dvh] items-center py-16">
      <div className="brut grid-dots w-full max-w-2xl bg-surface p-8 md:p-12">
        <div className="mono text-xs text-status-no">الصفحة غير موجودة</div>
        <h1 className="mt-3 text-5xl font-bold md:text-7xl">لم نجد هذه الصفحة.</h1>
        <p className="mt-4 text-lg text-ink-2">
          قد يكون الرابط قديمًا. ابحث عن الطعام الذي تريده، أو عد إلى دليل الأطعمة.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton to="/">الرئيسية</LinkButton>
          <Button variant="secondary" onClick={openSearch}>ابحث عن طعام</Button>
          <LinkButton to="/foods" variant="secondary">دليل الأطعمة</LinkButton>
        </div>
      </div>
    </div>
  );
}

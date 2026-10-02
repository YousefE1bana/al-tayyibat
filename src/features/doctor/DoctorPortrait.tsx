import { useState } from "react";
import { doctor } from "@/data/doctor";
import { cn } from "@/utils/cn";
import { assetUrl } from "@/lib/assets";

/**
 * Uses the supplied production portrait without modifying it.
 * If loading fails, show the doctor's name rather than a broken image.
 */
export function DoctorPortrait({ className, imgClassName, loading = "lazy" }: { className?: string; imgClassName?: string; loading?: "lazy" | "eager" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {!failed ? (
        <img
          src={assetUrl(doctor.portrait)}
          alt={`صورة ${doctor.displayName}`}
          width={1374}
          height={1145}
          loading={loading}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover object-top", imgClassName)}
          decoding="async"
        />
      ) : (
        <div className="grid-dots flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center" role="img" aria-label={`صورة ${doctor.displayName} — غير متوفرة`}>
          <span className="flex size-24 items-center justify-center border-2 border-line bg-bg text-5xl font-bold text-accent">ض</span>
          <span className="text-lg font-bold">{doctor.displayName}</span>
          <span className="mono max-w-[26ch] text-[11px] leading-relaxed text-muted">
            الصورة غير متاحة حاليًا
          </span>
        </div>
      )}
    </div>
  );
}

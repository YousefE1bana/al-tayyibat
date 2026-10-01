import { useState } from "react";
import { doctor } from "@/data/doctor";
import { cn } from "@/utils/cn";
import { assetUrl } from "@/lib/assets";

/**
 * The provided portrait must be placed at `public/images/doctor/portrait.jpg`.
 * Until then (or if it fails to load) we render a typographic placeholder — never a regenerated face.
 */
export function DoctorPortrait({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {!failed ? (
        <img
          src={assetUrl(doctor.portrait)}
          alt={`صورة ${doctor.displayName}`}
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

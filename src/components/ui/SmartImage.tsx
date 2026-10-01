import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { assetUrl } from "@/lib/assets";
import { Camera, ImageOff } from "lucide-react";
import { cn } from "@/utils/cn";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  imgClassName?: string;
}

/** Image with a branded fallback: never shows a broken icon or an empty box. */
export function SmartImage({ src, alt, fallbackLabel, className, imgClassName, ...rest }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setFailed(false); setLoaded(false); }, [src]);

  if (!src || failed) {
    const isAwaiting = !src;
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("hatch flex items-center justify-center bg-surface-2 text-muted select-none", className)}
      >
        <div className="flex flex-col items-center gap-1.5 p-3 text-center">
          {isAwaiting ? (
            <Camera className="size-6 opacity-60 text-accent/80" aria-hidden />
          ) : (
            <ImageOff className="size-6 opacity-60" aria-hidden />
          )}
          {fallbackLabel && <span className="mono text-[11px] font-medium leading-tight text-ink-2">{fallbackLabel}</span>}
          {isAwaiting && <span className="text-[10px] text-muted leading-tight">الصورة ستضاف لاحقًا</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {!loaded && <div className="hatch absolute inset-0 animate-pulse" aria-hidden />}
      <img
        src={assetUrl(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        {...rest}
      />
    </div>
  );
}

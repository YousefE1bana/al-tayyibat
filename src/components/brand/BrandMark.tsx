import { useState, type CSSProperties } from "react";
import { brand, type BrandAsset } from "@/config/brand";
import { useTheme } from "@/features/theme/ThemeProvider";
import { assetUrl } from "@/lib/assets";

/** Existing text identity remains the fallback; it is not an approved logo. */
function MarkImage({ asset }: { asset?: BrandAsset }) {
  const [failed, setFailed] = useState(false);
  if (!asset || failed) return <span className="brand-mark-legacy">ط</span>;
  return (
    <img src={assetUrl(asset.src)} width={asset.width} height={asset.height} alt=""
      className="brand-mark-image" decoding="async" onError={() => setFailed(true)} />
  );
}

/** Decorative beside a brand name or inside an already labelled link. */
export function BrandMark({ size = "navigation" }: { size?: keyof typeof brand.markSizes }) {
  const { theme } = useTheme();
  const asset = brand.mark?.[theme] ?? brand.mark?.default;
  return (
    <span className="brand-mark" style={{ "--brand-mark-size": `${brand.markSizes[size]}px`, "--brand-mark-compact-size": `${brand.markSizes.compact}px` } as CSSProperties} aria-hidden="true">
      <MarkImage key={asset?.src ?? "legacy"} asset={asset} />
    </span>
  );
}

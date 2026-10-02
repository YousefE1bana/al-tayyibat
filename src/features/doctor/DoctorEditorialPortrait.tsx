import { useState } from "react";
import { doctorAssets, type EditorialPortraitAsset } from "@/config/doctor-assets";
import { assetUrl } from "@/lib/assets";
import { cn } from "@/utils/cn";
import { DoctorPortrait } from "./DoctorPortrait";

function ApprovedPortrait({ asset, className }: { asset: EditorialPortraitAsset; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("doctor-editorial-portrait", className)} data-treatment={asset.treatment}
      style={{ aspectRatio: `${asset.width} / ${asset.height}` }}>
      {failed ? <DoctorPortrait className="h-full w-full" /> : <img src={assetUrl(asset.src)} alt={asset.alt} width={asset.width} height={asset.height}
        loading="lazy" decoding="async" onError={() => setFailed(true)}
        style={{ objectPosition: asset.objectPosition ?? "center top" }} />}
    </div>
  );
}

/** An unapproved secondary asset creates neither a request nor an empty slot. */
export function DoctorEditorialPortrait({ className }: { className?: string }) {
  const asset = doctorAssets.editorial;
  if (!asset) return null;
  return <ApprovedPortrait key={asset.src} asset={asset} className={className} />;
}

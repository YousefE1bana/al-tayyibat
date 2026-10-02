/** Activate only supplied, approved assets. Null entries never request future files. */
export interface BrandAsset {
  src: string;
  width: number;
  height: number;
}

export interface BrandMarkAssets {
  default: BrandAsset;
  dark?: BrandAsset;
  light?: BrandAsset;
}

export const brand: {
  name: string;
  mark: BrandMarkAssets | null;
  icon: BrandAsset;
  markSizes: Record<"compact" | "navigation" | "display", number>;
  iconReviewSizes: readonly number[];
} = {
  name: "نظام الطيبات",
  mark: { default: { src: "/brand/mark.png", width: 256, height: 209 } },
  icon: { src: "/brand/icon.png", width: 512, height: 512 },
  markSizes: { compact: 24, navigation: 36, display: 48 },
  iconReviewSizes: [16, 32, 48, 192, 512],
};

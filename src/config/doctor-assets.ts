export interface EditorialPortraitAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  treatment: "photograph" | "cutout";
  objectPosition?: string;
}

/** Never point this at assets/doctor/secondary-original.jpg or the protected primary. */
export const doctorAssets: { editorial: EditorialPortraitAsset | null } = {
  editorial: {
    src: "/images/doctor/secondary.webp",
    width: 1128,
    height: 1094,
    alt: "الدكتور ضياء العوضي جالسًا ببدلة سوداء — صورة تحريرية بخلفية شفافة",
    treatment: "cutout",
  },
};

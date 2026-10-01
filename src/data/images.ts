/** Local photography registry. Canonical food photos are assigned in foods.ts. */

export const images = {
  rice: "/images/foods/basmati-rice.jpg",
  potatoes: "/images/foods/baked-potatoes.jpg",
  potatoWedges: "/images/foods/local-potatoWedges.jpg",
  beef: "/images/foods/beef.jpg",
  sardines: "/images/foods/sardines.jpg",
  pigeon: "/images/foods/pigeon.jpg",
  agedCheese: "/images/foods/aged-cheese.jpg",
  grapes: "/images/foods/grapes.jpg",
  oliveOil: "/images/foods/olive-oil.jpg",
  olives: "/images/foods/olives.jpg",
  nuts: "/images/foods/nuts.jpg",
  turkishCoffee: "/images/foods/turkish-coffee.jpg",
  wholeWheatToast: "/images/foods/whole-wheat-toast.jpg",
  stuffedZucchini: "/images/foods/zucchini.jpg",
  eggs: "/images/foods/eggs.jpg",
  spinach: "/images/foods/leafy-greens.jpg",
  lentils: "/images/foods/legumes.jpg",
  biscuits: "/images/foods/biscuits.jpg",
  naturalCream: "/images/foods/natural-cream.jpg",
  halawa: "/images/foods/halawa.jpg",
  taro: "/images/foods/taro.jpg",
  okra: "/images/foods/okra.jpg",
  eggplant: "/images/foods/eggplant.jpg",
  mixedMahshi: "/images/foods/traditional-mahshi.jpg",
  lentilSoup: "/images/foods/local-lentilSoup.jpg",
  doctorPortrait: "/images/doctor/portrait.jpg",
} as const;

export type ImageKey = keyof typeof images;

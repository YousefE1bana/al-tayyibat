/** Arabic text normalization used by search and matching. */

const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g; // harakat + tatweel
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g; // آ أ إ ٱ
const YEH_VARIANTS = /[\u0649\u06CC]/g; // ى ی
const TEH_MARBUTA = /\u0629/g; // ة
const WAW_HAMZA = /\u0624/g; // ؤ
const YEH_HAMZA = /\u0626/g; // ئ
const PUNCT = /[،؛؟!.,;:'"«»()\[\]{}\-_/\\]/g;

export function normalizeArabic(input: string): string {
  return input
    .toLowerCase()
    .replace(DIACRITICS, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(YEH_VARIANTS, "ي")
    .replace(TEH_MARBUTA, "ه")
    .replace(WAW_HAMZA, "و")
    .replace(YEH_HAMZA, "ي")
    .replace(PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strips the definite article "ال" so "البطاطس" matches "بطاطس". */
export function stripArticle(input: string): string {
  return input.replace(/(^|\s)ال(?=\S)/g, "$1");
}

export function normalizeForSearch(input: string): string {
  const base = normalizeArabic(input);
  const stripped = stripArticle(base);
  return stripped === base ? base : `${base} ${stripped}`;
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Converts western digits to Eastern Arabic numerals for display. */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** Pads a number for terminal-style labels: 01, 02 ... */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

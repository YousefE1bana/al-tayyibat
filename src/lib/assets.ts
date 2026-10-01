/** Public assets use the same deployment base as Vite's scripts and fonts. */
export function assetUrl(src: string): string {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  return `${import.meta.env.BASE_URL}${src.slice(1)}`;
}

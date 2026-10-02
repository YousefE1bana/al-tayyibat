import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { pwa } from "../src/config/pwa";

const base = process.env.VITE_BASE_PATH || "/al-tayyibat/";
for (const icon of [...pwa.icons, { src: pwa.appleIcon, sizes: "180x180" }]) {
  const metadata = await sharp(`public/${icon.src}`).metadata();
  const [width, height] = icon.sizes.split("x").map(Number);
  if (metadata.format !== "png" || metadata.width !== width || metadata.height !== height) throw new Error(`Invalid icon: ${icon.src}`);
}
const mask = await sharp("public/brand/maskable-512.png").ensureAlpha().raw().toBuffer();
for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
  const pixel = (y * 512 + x) * 4;
  if (mask[pixel + 3] !== 255) throw new Error("Maskable icon must have opaque background");
  if (Math.hypot(x - 255.5, y - 255.5) > 204.8 && (mask[pixel] !== 14 || mask[pixel + 1] !== 19 || mask[pixel + 2] !== 16)) throw new Error("Artwork outside maskable safe area");
}
for (const path of ["brand/mark.png", "brand/icon.png", "images/doctor/portrait.jpg", "images/doctor/secondary.webp"]) await access(`public/${path}`);
if (process.argv.includes("--build")) {
  const manifest = JSON.parse(await readFile("dist/manifest.webmanifest", "utf8"));
  if (manifest.name !== pwa.name || manifest.start_url !== `${base}#/` || manifest.scope !== base || manifest.id !== base || manifest.display !== "standalone" || manifest.lang !== "ar" || manifest.dir !== "rtl") throw new Error("Invalid production manifest/base path");
  for (const icon of manifest.icons) await access(`dist/${icon.src.slice(base.length)}`);
  const html = await readFile("dist/index.html", "utf8");
  if (!html.includes(`href="${base}manifest.webmanifest"`) || !html.includes(`href="${base}${pwa.appleIcon}"`)) throw new Error("Manifest/mobile metadata not integrated");
  const worker = await readFile("dist/sw.js", "utf8");
  const urls = [...worker.matchAll(/\{"revision":(?:"[^"]*"|null),"url":"([^"]+)"\}/g)].map(match => match[1]);
  if (!urls.includes("index.html") || !urls.includes("manifest.webmanifest") || !urls.includes("data/foods.json") || urls.some(url => url.includes("images/foods/"))) throw new Error("Invalid precache: missing shell/data or contains food images");
  const files = await Promise.all(urls.map(async url => ({ url, bytes: (await stat(`dist/${decodeURI(url)}`)).size })));
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  if (totalBytes > 5 * 1024 * 1024) throw new Error("Precache exceeds 5 MiB budget");
  await mkdir("output/pwa", { recursive: true });
  await writeFile("output/pwa/precache-report.json", JSON.stringify({ files, count: files.length, totalBytes, runtimeFoodCache: pwa.foodCache, workerBytes: (await stat("dist/sw.js")).size }, null, 2));
  console.log(`Production PWA verified: ${files.length} precached files, ${totalBytes} bytes; no food photos precached.`);
}
console.log("PWA icons, opaque maskable safe area and required brand assets verified.");

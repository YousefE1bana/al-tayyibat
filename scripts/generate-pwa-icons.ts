import sharp from "sharp";
import { copyFile } from "node:fs/promises";
import { brand } from "../src/config/brand";
import { pwa } from "../src/config/pwa";

const master = `public${brand.icon.src}`;
for (const size of [192, 512]) {
  if (size === brand.icon.width && size === brand.icon.height) await copyFile(master, `public/brand/pwa-${size}.png`);
  else await sharp(master).resize(size, size, { fit: "contain" }).png().toFile(`public/brand/pwa-${size}.png`);
}
// A 288px square is wholly inside the central 80% safe-area circle at 512px.
// Scaling only: preserve the approved artwork, including its existing clear space.
const inset = await sharp(master).resize(288, 288).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: pwa.themeColor } })
  .composite([{ input: inset, left: 112, top: 112 }]).png().toFile("public/brand/maskable-512.png");
await sharp({ create: { width: 180, height: 180, channels: 4, background: pwa.themeColor } })
  .composite([{ input: await sharp(master).resize(160, 160).png().toBuffer(), left: 10, top: 10 }])
  .png().toFile(`public/${pwa.appleIcon}`);
console.log("Generated faithful PWA and Apple icons from the approved icon master.");

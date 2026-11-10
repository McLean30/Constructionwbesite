// Derives the art-directed crops used on the site from the supplied concept visualisation.
//   node scripts/art/crop-visualisation.mjs
// Source: assets-src/courtyard-house-visualisation-original.webp (1672 x 941, see ASSETS.md)
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(root, "assets-src/courtyard-house-visualisation-original.webp");
const out = (n) => path.join(root, "public/images", n);

// [file, left, top, width, height, purpose]
const crops = [
  ["courtyard-house-visualisation.webp", 0, 0, 1672, 941, "full frame, desktop hero"],
  ["courtyard-house-visualisation-phone.webp", 540, 0, 940, 941, "phone hero: courtyard and glazed living room"],
];

// Dedicated AI-generated views supplied for the gallery (see ASSETS.md): [source, output, crop|null, purpose]
// The oak material uses courtyard-house-soffit.webp directly (no crop).
const views = [
  ["courtyard-house-street-approach-original.png", "courtyard-house-street-approach.webp", null, "street approach, gallery, homepage preview and design question"],
  ["courtyard-house-garden-elevation-original.webp", "courtyard-house-garden-elevation.webp", null, "garden elevation, gallery"],
  ["courtyard-house-sitting-room-original.webp", "courtyard-house-sitting-room.webp", null, "sitting room, gallery and homepage preview"],
  ["courtyard-house-soffit-original.webp", "courtyard-house-soffit.webp", null, "zinc edge and oak soffit junction"],
  ["courtyard-house-zinc-roof-original.webp", "courtyard-house-material-zinc.webp", null, "material: standing-seam zinc"],
  ["courtyard-house-brick-original.webp", "courtyard-house-material-brick.webp", null, "material: buff brick"],
];

for (const [file, left, top, width, height, purpose] of crops) {
  if (width === 1672) {
    // the full frame is copied byte for byte: next/image produces the responsive sizes
    fs.copyFileSync(src, out(file));
    console.log(`${file}  copied unchanged`);
    continue;
  }
  await sharp(src).extract({ left, top, width, height }).webp({ quality: 88, effort: 6 }).toFile(out(file));
  console.log(`${file}  ${width}x${height}  ${purpose}`);
}

for (const [srcFile, file, crop, purpose] of views) {
  let img = sharp(path.join(root, "assets-src", srcFile));
  if (crop) img = img.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
  // re-encoded once as the master; next/image derives the responsive sizes from it
  let info = await img.webp({ quality: 84, effort: 6, smartSubsample: true }).toFile(out(file));
  const original = path.join(root, "assets-src", srcFile);
  if (!crop && info.size >= fs.statSync(original).size) {
    fs.copyFileSync(original, out(file)); // the supplied file is already smaller: keep it as is
    info = { ...info, size: fs.statSync(original).size };
  }
  console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB  ${purpose}`);
}

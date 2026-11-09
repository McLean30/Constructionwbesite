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
  ["courtyard-house-visualisation-soffit.webp", 1250, 150, 422, 300, "zinc roof edge meeting the oak soffit"],
  ["courtyard-house-material-zinc.webp", 90, 40, 520, 300, "standing-seam zinc roof"],
  ["courtyard-house-material-brick.webp", 300, 340, 220, 300, "buff brick wall"],
  ["courtyard-house-material-oak.webp", 1262, 300, 180, 300, "oak soffit and timber boarding"],
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

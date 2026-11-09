// Exports the Courtyard House model (scripts/art/model.mjs) for the 3D assembly.
//   node scripts/art/export-model.mjs  ->  public/model/courtyard-house.json
//
// The same geometry that draws the stage plates is triangulated here, grouped by
// the model layers declared in content/stages.ts. Units are metres; x east, y up,
// z south (towards the garden). The camera block reproduces the plate framing so
// the 3D view can open exactly where the illustration is.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as E from "./engine.mjs";
import { buildModel, boundsPoints, PAL, GRAPHITE } from "./model.mjs";
import { stages, allModelLayers } from "../../content/stages.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "public/model/courtyard-house.json");

export const AXO_DIR = [1, 1.15, 1.35];
const PLATE = { width: 1600, height: 920, margin: 34 };

const r3 = (v) => Math.round(v * 1000) / 1000;

// --- ear-clipping triangulation for planar (possibly concave) polygons ---
function triangulate(pts) {
  if (pts.length === 3) return [[0, 1, 2]];
  const n = E.newell(pts);
  const ax = Math.abs(n[0]) > Math.abs(n[1]) ? (Math.abs(n[0]) > Math.abs(n[2]) ? 0 : 2) : Math.abs(n[1]) > Math.abs(n[2]) ? 1 : 2;
  const [i0, i1] = [0, 1, 2].filter((i) => i !== ax);
  // dropping y leaves (x, z), whose 2D cross product points along -y
  const sign = (n[ax] >= 0 ? 1 : -1) * (ax === 1 ? -1 : 1);
  const p2 = pts.map((p) => [p[i0], p[i1]]);
  const cross = (a, b, c) => ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) * sign;
  const inside = (p, a, b, c) => cross(a, b, p) >= -1e-12 && cross(b, c, p) >= -1e-12 && cross(c, a, p) >= -1e-12;
  const idx = pts.map((_, i) => i);
  const tris = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 1000) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const ia = idx[(k + idx.length - 1) % idx.length];
      const ib = idx[k];
      const ic = idx[(k + 1) % idx.length];
      if (cross(p2[ia], p2[ib], p2[ic]) <= 1e-12) continue; // reflex or degenerate
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inside(p2[j], p2[ia], p2[ib], p2[ic]))) continue;
      tris.push([ia, ib, ic]);
      idx.splice(k, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) tris.push(idx);
  return tris;
}

// cull: false keeps every blockwork face, because in 3D the inner leaf stands alone at the Structure stage
const model = buildModel({ stage: "finish", mode: "drawing", palette: "raw", theme: "graphite", cull: false });

// colour overrides for the built model (drawing colours are tuned for paper)
const COLOUR = {
  "steel-goalpost-frames": "#4b5156", // painted steel, dark grey
  "courtyard-void": "#4a504b",
  "site-base": "#535d5c", // lit to read like the plate's mid-grey site base
};
const GLASS_DECAL = "#55666c";

const palette = [];
const pal = (hex) => {
  const h = hex.toLowerCase();
  let i = palette.indexOf(h);
  if (i < 0) i = palette.push(h) - 1;
  return i;
};

const layers = {};
for (const l of allModelLayers) layers[l.id] = { stage: l.stage, material: l.material, solid: { p: [], c: [] }, glass: { p: [] }, decal: { p: [], c: [] }, lines: [], sprites: [] };

const pushPoly = (bucket, pts, colour) => {
  for (const t of triangulate(pts)) {
    for (const i of t) bucket.p.push(...pts[i].map(r3));
    if (bucket.c) bucket.c.push(pal(colour));
  }
};
const lineBucket = (layer, colour, dashed) => {
  const L = layers[layer];
  let b = L.lines.find((x) => x.c === colour && x.dashed === !!dashed);
  if (!b) L.lines.push((b = { c: colour, dashed: !!dashed, p: [] }));
  return b;
};

for (const s of [...model.ground, ...model.solids]) {
  const layer = s.layer;
  const L = layers[layer];
  if (!L) throw new Error(`Unknown layer ${layer}`);
  for (const f of s.faces) {
    if (f.glass) pushPoly(L.glass, f.pts);
    else pushPoly(L.solid, f.pts, COLOUR[layer] || f.fill);
    for (const d of f.details) {
      const dl = d.layer || layer;
      if (d.type === "line") {
        if ((d.stroke || "").toLowerCase() === PAL.brickLine) continue; // coursing reads as noise in 3D
        lineBucket(dl, (d.stroke || GRAPHITE.ink).toLowerCase(), d.dash).p.push(...d.pts.flat().map(r3));
      } else {
        pushPoly(layers[dl].decal, d.pts, d.glass ? GLASS_DECAL : d.fill && !d.fill.startsWith("url") ? d.fill : GLASS_DECAL);
      }
    }
  }
}

for (const sp of model.sprites) {
  const { kind, at, height, spread, stems, colour, trunk, seated, child } = sp.meta;
  layers[sp.layer].sprites.push({ kind, at: at.map(r3), height, spread, stems, colour, trunk, seated, child });
}

const plateBounds = boundsPoints().map(([x, y, z]) => [x, Math.min(y, 2.5), z]);

const data = {
  name: "Courtyard House",
  generatedBy: "scripts/art/export-model.mjs from scripts/art/model.mjs",
  units: "m",
  axes: { x: "east", y: "up", z: "south (garden)" },
  camera: { dir: AXO_DIR, plate: PLATE, bounds: plateBounds },
  palette,
  stages: stages.map((s) => ({ id: s.id, layers: s.modelLayers.map((l) => l.id), markers: s.markers })),
  layers,
  anchors: model.anchors.map((a) => ({ id: a.id, stage: a.stage, label: a.label, point: a.point.map(r3) })),
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(data));
const tris = Object.values(layers).reduce((n, l) => n + l.solid.c.length + l.decal.c.length + l.glass.p.length / 9, 0);
console.log(`Model exported: ${Object.keys(layers).length} layers, ${tris} triangles, ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);

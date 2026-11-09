// Generates every image used by the site from the Courtyard House model.
//   node scripts/art/build-art.mjs
// Outputs:
//   public/stages/<stage>.svg         stage explorer drawings (same viewpoint)
//   public/images/*.webp              gallery and hero images (rasterised)
//   art/*.svg                         vector masters of the raster images
//   content/generated/annotations.json  projected label positions for each view

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as E from "./engine.mjs";
import { buildModel, boundsPoints, PAL, GRAPHITE } from "./model.mjs";
import { interiorSvg, detailSvg } from "./views2d.mjs";
import { stages } from "../../content/stages.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = (...p) => path.join(root, ...p);
for (const d of ["public/stages", "public/images", "art", "content/generated"]) fs.mkdirSync(out(d), { recursive: true });

const annotations = {};
const pct = (cam, p) => {
  const [x, y] = E.project(cam, p);
  return { x: +((x / cam.width) * 100).toFixed(2), y: +((y / cam.height) * 100).toFixed(2) };
};
const recordAnchors = (key, cam, anchors, filter = () => true) => {
  // numbered left to right so the legend reads in the same order as the image
  annotations[key] = anchors
    .filter(filter)
    .map((a) => ({ id: a.id, label: a.label, stage: a.stage, ...pct(cam, a.point) }))
    .sort((p, q) => p.x - q.x);
};

const merge = (...models) => ({
  solids: models.flatMap((m) => m.solids),
  ground: models.flatMap((m) => m.ground),
  sprites: models.flatMap((m) => m.sprites),
  anchors: models.flatMap((m) => m.anchors),
  overlays: models.flatMap((m) => m.overlays),
});

const paperDefs = `<pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${PAL.paper}"/><circle cx="1" cy="1" r=".5" fill="#e6e0d2"/></pattern>`;

// ---------------- stage drawings ----------------
const AXO_DIR = [1, 1.15, 1.35];
const AXO_LIGHT = [-0.45, 0.85, 0.55];

function stageDrawing(stageId, theme = "paper") {
  const dark = theme === "graphite";
  const H = dark ? 920 : 1100;
  // the plate is framed on the site base; the courtyard tree stays well inside it
  const plateBounds = boundsPoints().map(([x, y, z]) => [x, Math.min(y, 2.5), z]);
  const cam = E.fitOrtho(E.orthographic({ dir: AXO_DIR, width: 1600, height: H }), dark ? plateBounds : boundsPoints(), dark ? 34 : 70);
  const m = buildModel({ stage: stageId, highlight: stageId, mode: "drawing", theme });
  // drafting-board grid behind the graphite plate
  let grid = "";
  if (dark) for (let x = 40; x < 1600; x += 40) for (let y = 40; y < H; y += 40) grid += `M${x - 3} ${y}h6M${x} ${y - 3}v6`;
  const svg = E.render(cam, {
    solids: m.solids,
    groundSolids: m.ground,
    sprites: m.sprites,
    light: AXO_LIGHT,
    ambient: dark ? 0.84 : 0.78,
    diffuse: dark ? 0.22 : 0.26,
    edge: dark ? GRAPHITE.ink : PAL.ink,
    edgeOpacity: dark ? 0.62 : 0.75,
    edgeWidth: 1,
    shadow: { opacity: dark ? 0.28 : 0.1, groundY: 0, colour: dark ? "#0d0f0e" : PAL.ink },
    background: `<rect width="1600" height="${H}" fill="${dark ? GRAPHITE.bg : PAL.paper}"/>${dark ? `<path d="${grid}" stroke="#3a3f3b" stroke-width="1"/>` : ""}`,
    overlay: m.overlays.map((o) => o(cam)).join(""),
  });
  if (!dark) recordAnchors(`stage-${stageId}`, cam, m.anchors, (a) => a.stage === stageId && a.id !== "entrance");
  else recordAnchors(`plate-${stageId}`, cam, m.anchors, (a) => a.stage === stageId && a.id !== "entrance");
  return svg;
}

// ---------------- hero: garden elevation ----------------
function sceneBackground(cam, { skyTop = "#a9bfcb", skyLow = "#eee8da", hillTone = "#a7b0a6" } = {}) {
  const horizon = E.project(cam, E.add(cam.pos, [cam.forward[0] * 2000, 0, cam.forward[2] * 2000]))[1];
  const W = cam.width;
  const H = cam.height;
  E.reseed(5);
  let hills = "";
  const layers = [
    { amp: 70, base: 18, tone: E.mix(hillTone, skyLow, 0.45) },
    { amp: 40, base: 4, tone: E.mix(hillTone, skyLow, 0.15) },
  ];
  for (const l of layers) {
    let d = `M0 ${horizon + 2}`;
    const step = W / 24;
    let phase = E.rand() * 10;
    for (let x = 0; x <= W + step; x += step) {
      const y = horizon - l.base - l.amp * (0.55 + 0.45 * Math.sin(x / (W / 3.1) + phase)) * (0.6 + 0.4 * Math.sin(x / (W / 9) + phase * 2));
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += `L${W} ${horizon + 2}Z`;
    hills += `<path d="${d}" fill="${l.tone}"/>`;
  }
  let clouds = "";
  for (let i = 0; i < 9; i++) {
    const cx = E.rand() * W;
    const cy = horizon * (0.15 + E.rand() * 0.55);
    const rx = W * (0.08 + E.rand() * 0.12);
    clouds += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.22).toFixed(0)}" fill="#f7f5ef" opacity="${(0.35 + E.rand() * 0.35).toFixed(2)}" filter="url(#soft)"/>`;
  }
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyLow}"/></linearGradient>
<linearGradient id="lawn" gradientUnits="userSpaceOnUse" x1="0" y1="${horizon}" x2="0" y2="${H}"><stop offset="0" stop-color="#a9b08f"/><stop offset="1" stop-color="#7f8d62"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#dfe6e3" stop-opacity="0.85"/><stop offset="0.45" stop-color="#9fb3b8" stop-opacity="0.55"/><stop offset="1" stop-color="#5f7378" stop-opacity="0.6"/></linearGradient>
<filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${(W / 160).toFixed(1)}"/></filter>
<filter id="shadowBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(W / 900).toFixed(1)}"/></filter>`;
  return { horizon, defs, background: `<rect width="${W}" height="${H}" fill="url(#sky)"/>${clouds}${hills}` };
}

function lawn(extent = 400) {
  return E.plane(
    [
      [-extent, 0, -extent],
      [extent, 0, -extent],
      [extent, 0, extent],
      [-extent, 0, extent],
    ],
    { fill: "url(#lawn)", flat: true, stroke: null, bias: 1000 },
  );
}

function sceneSprites(list) {
  E.reseed(19);
  return list.map(([x, z, h, s, c]) => E.tree([x, 0, z], { height: h, spread: s, colour: c, lineScale: 1.2 }));
}

function hero() {
  const cam = E.perspective({ pos: [13.6, 1.5, 50], target: [9.8, 3.75, 8], fov: 22.6, width: 2400, height: 1320 });
  const bg = sceneBackground(cam);
  const m = buildModel({ stage: "finish", mode: "scene", brickSpacing: 0.1 });
  const stones = [];
  for (let i = 0; i < 9; i++) {
    const z = 20.2 + i * 1.1;
    const x = 4.4 + i * 0.55;
    stones.push(E.plane([[x, 0.02, z], [x + 1.1, 0.02, z], [x + 1.1, 0.02, z + 0.6], [x, 0.02, z + 0.6]], { fill: "#c9c0ad", flat: true, stroke: "#8e8471", strokeOpacity: 0.4, bias: -1 }));
  }
  const trees = sceneSprites([
    [-4, -9, 10, 3.8, "#7f8b74"],
    [4.5, -13, 11.5, 4.2, "#8a9580"],
    [13, -11, 9, 3.6, "#7d8a72"],
    [22, -10, 12, 4.5, "#76846c"],
    [28, -3, 8.5, 3.4, "#7c8a6c"],
    [-9, 6, 8, 3.2, "#6e7d58"],
    [29, 12, 6, 2.6, "#7a8862"],
    [-8, 19, 3, 1.6, "#6f7f55"],
    [-5.5, 23, 1.8, 1.2, "#66764d"],
    [26, 21, 2.6, 1.4, "#6f7f55"],
    [23.5, 25, 1.5, 1.1, "#66764d"],
    [-6, 36, 2.2, 1.8, "#5f6f47"],
    [29, 35, 2.6, 2.0, "#5f6f47"],
  ]);
  const svg = E.render(cam, {
    solids: m.solids,
    groundSolids: [lawn(), ...m.ground, ...stones],
    sprites: [...m.sprites, ...trees],
    light: [-0.55, 0.7, 0.65],
    ambient: 0.74,
    diffuse: 0.3,
    edgeWidth: 1.25,
    edgeOpacity: 0.55,
    shadow: { opacity: 0.2, filter: "url(#shadowBlur)" },
    defs: bg.defs,
    background: bg.background,
  });
  recordAnchors("hero", cam, m.anchors, (a) => ["brick", "zinc", "soffit", "courtyard"].includes(a.id));
  return svg;
}

// ---------------- street approach ----------------
function street() {
  const cam = E.perspective({ pos: [31, 1.6, -19.5], target: [8.5, 2.3, 3], fov: 30, width: 1800, height: 1200 });
  const bg = sceneBackground(cam, { skyTop: "#aebcc4", skyLow: "#e6e3d9" });
  const m = buildModel({ stage: "finish", mode: "scene", brickSpacing: 0.15 });
  const flat = (pts, fill, extra = {}) => E.plane(pts, { fill, flat: true, stroke: null, ...extra });
  const road = flat([[-200, 0.005, -9], [200, 0.005, -9], [200, 0.005, -200], [-200, 0.005, -200]], "#7c7f7e", { bias: 500 });
  const farPave = flat([[-200, 0.03, -15.5], [200, 0.03, -15.5], [200, 0.03, -200], [-200, 0.03, -200]], "#c6c1b6", { bias: 450 });
  const pave = flat([[-200, 0.03, -6], [200, 0.03, -6], [200, 0.03, -9], [-200, 0.03, -9]], "#c6c1b6", { bias: 400 });
  pave.faces[0].details.push(...E.hatch(pave.faces[0], { drop: "y", scan: "x", spacing: 0.9, offset: 0, style: { stroke: "#8f8a80", strokeOpacity: 0.5, strokeWidth: 0.6 } }));
  const kerb = E.box(-200, 0, -9.15, 200, 0.12, -9, { fill: "#b5b0a5", castShadow: false });
  const gravel = flat([[-2, 0.02, -6], [22, 0.02, -6], [22, 0.02, 0], [-2, 0.02, 0]], "#d3cab7", { bias: 300 });
  const path_ = flat([[8.7, 0.035, -6], [10.0, 0.035, -6], [10.0, 0.035, 0], [8.7, 0.035, 0]], "#bfb5a0", { stroke: "#8e8471", strokeOpacity: 0.5, bias: 200 });
  const wallBrick = { fill: PAL.brick };
  const wallA = E.box(-2, 0, -6, 8.4, 0.6, -5.75, wallBrick);
  const wallB = E.box(10.3, 0, -6, 22, 0.6, -5.75, wallBrick);
  for (const w of [wallA, wallB])
    for (const f of w.faces) if (Math.abs(f.normal[1]) < 0.2) f.details.push(...E.hatch(f, { drop: Math.abs(f.normal[0]) > 0.5 ? "x" : "z", scan: "y", spacing: 0.15, offset: 0, style: { stroke: PAL.brickLine, strokeOpacity: 0.3, strokeWidth: 0.55 } }));
  const hedgeTrees = [];
  E.reseed(77);
  for (let x = -1.5; x < 21.5; x += 1.1) if (x < 6.5 || x > 12.5) hedgeTrees.push(E.tree([x, 0.6, -5.3], { height: 0.65, spread: 0.6, colour: "#5f6f4c", trunk: "#5f6f4c", lineScale: 0.8 }));
  const trees = sceneSprites([
    [-6, 10, 10, 4, "#6c7b5d"],
    [3, 24, 12, 4.6, "#73826a"],
    [16, 26, 11, 4.2, "#6a7a60"],
    [26, 18, 9, 3.6, "#728160"],
    [10.2, 9.6, 6.4, 2.5, "#76875a"],
  ]);
  const walker = E.person([12.6, 0.03, -7.6], { colour: "#55606b" });
  const svg = E.render(cam, {
    solids: [...m.solids, kerb, wallA, wallB],
    groundSolids: [lawn(), road, farPave, pave, gravel, path_],
    sprites: [...m.sprites.filter((s) => s.at[2] > 0), ...trees, ...hedgeTrees, walker],
    light: [-0.55, 0.7, 0.65],
    ambient: 0.88,
    diffuse: 0.2,
    edgeWidth: 1.1,
    edgeOpacity: 0.55,
    shadow: { opacity: 0.16, filter: "url(#shadowBlur)" },
    defs: bg.defs,
    background: bg.background,
  });
  recordAnchors("street", cam, m.anchors, (a) => ["entrance"].includes(a.id));
  return svg;
}

// ---------------- exploded construction axonometric ----------------
function exploded() {
  const tiers = { foundations: 0, structure: 11, envelope: 22.5, finish: 34 };
  const EXP_DIR = [1, 0.72, 1.35];
  const models = stages.map((s) => buildModel({ only: s.id, offset: [0, tiers[s.id], 0], mode: "drawing", highlight: null }));
  const m = merge(...models);
  const bounds = [...m.solids, ...m.ground].flatMap((so) => so.faces.flatMap((f) => f.pts));
  bounds.push([10.2, tiers.finish + 6.6, 9.6]);
  const cam = E.fitOrtho(E.orthographic({ dir: EXP_DIR, width: 1600, height: 6000 }), bounds, 60);
  cam.scale *= 0.84;
  cam.shift = cam.shift.map((v) => v * 0.84);
  cam.shift[0] -= 140;
  const ys = bounds.map((p) => cam.toCam(p)[1] * cam.scale);
  cam.height = Math.ceil(Math.max(...ys) - Math.min(...ys) + 160);
  // dashed alignment lines between tiers at the four outer corners
  const corners = [[0, 0], [20, 0], [20, 14], [0, 17]];
  let guides = "";
  for (const [x, z] of corners) {
    const a = E.project(cam, [x, 0.2, z]);
    const b = E.project(cam, [x, tiers.finish + 0.2, z]);
    guides += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${PAL.orange}" stroke-width="1.2" stroke-dasharray="4 6" opacity="0.8"/>`;
  }
  let labels = "";
  stages.forEach((s) => {
    const c = E.project(cam, [10, tiers[s.id] + 1.5, 9]);
    const p = [1600 - 300, c[1]];
    labels += `<g font-family="'Barlow Condensed','Arial Narrow',Arial,sans-serif" fill="${PAL.ink}"><path d="M${(p[0] - 70).toFixed(1)} ${p[1].toFixed(1)}H${(p[0] + 8).toFixed(1)}" stroke="${PAL.orange}" stroke-width="2"/><text x="${(p[0] + 18).toFixed(1)}" y="${(p[1] + 6).toFixed(1)}" font-size="30" font-weight="600">0${s.number}</text><text x="${(p[0] + 18).toFixed(1)}" y="${(p[1] + 34).toFixed(1)}" font-size="22" letter-spacing="1.5">${s.title.toUpperCase()}</text></g>`;
  });
  const svg = E.render(cam, {
    solids: m.solids,
    groundSolids: m.ground,
    sprites: m.sprites,
    light: AXO_LIGHT,
    ambient: 0.78,
    diffuse: 0.26,
    background: `<rect width="1600" height="${cam.height}" fill="${PAL.paper}"/>${guides}`,
    overlay: labels,
  });
  return svg;
}

// ---------------- write everything ----------------
async function raster(name, svg, width) {
  fs.writeFileSync(out("art", `${name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 72, limitInputPixels: false })
    .resize({ width })
    .webp({ quality: 84, effort: 5 })
    .toFile(out("public/images", `${name}.webp`));
}

for (const s of stages) {
  fs.writeFileSync(out("public/stages", `${s.id}.svg`), stageDrawing(s.id));
  fs.writeFileSync(out("public/stages", `plate-${s.id}.svg`), stageDrawing(s.id, "graphite"));
}
await raster("courtyard-house-garden", hero(), 2400);
await raster("courtyard-house-street", street(), 1800);
await raster("courtyard-house-construction", exploded(), 1600);
await raster("courtyard-house-interior", interiorSvg(), 1800);
const detail = detailSvg();
await raster("courtyard-house-detail", detail.svg, 1600);
annotations.detail = detail.annotations;
annotations.interior = [];
fs.writeFileSync(out("content/generated/annotations.json"), JSON.stringify(annotations, null, 2) + "\n");
console.log("Art generated:", Object.keys(annotations).join(", "));

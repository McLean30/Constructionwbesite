// Courtyard House concept geometry, organised by the model layers declared in
// content/stages.ts. Units are metres: x runs east, y up, z south (towards the garden).
//
// Plan: two parallel wings run from the street (north, z = 0) towards the garden.
// A low entrance link joins them at the street, so the courtyard between them is
// sheltered on three sides and open to the garden on the fourth.

import { stages } from "../../content/stages.ts";
import * as E from "./engine.mjs";

export const PAL = {
  paper: "#f4f1e9",
  ink: "#202421",
  orange: "#ff6534",
  concrete: "#bdbab2",
  block: "#c9c7c0",
  steel: "#ff6534",
  softwood: "#d8c29a",
  brick: "#d9c6a0",
  brickLine: "#8f7b5a",
  glass: "#9fb3b8",
  zinc: "#3b3f42",
  sarking: "#cdb68e",
  oak: "#b88a55",
  oakFloor: "#c9a274",
  plaster: "#ebe6dc",
  stone: "#cfc6b4",
  planting: "#6f7f55",
  void: "#2d3330",
};

export const GRAPHITE = { bg: "#262a27", ink: "#e6e1d4", base: "#353a36", void: "#2e332f" };

const layerStage = {};
for (const s of stages) for (const l of s.modelLayers) layerStage[l.id] = s.id;
const order = { foundations: 1, structure: 2, envelope: 3, finish: 4 };

// Key dimensions
export const DIM = {
  SL: 0.2, // slab top
  EAVE: 3.0,
  RIDGE: 4.5,
  BEAM: 2.6, // underside of gable over garden opening
  OH_E: 0.35, // eaves overhang
  OH_G: 1.6, // garden overhang (deep soffit)
  OH_S: 0.25, // street overhang
  I: 0.2, // inner leaf inset from outer face
  T: 0.12, // inner leaf thickness
  LINK_Z: 4.5,
};

export const WINGS = [
  { id: "west", x0: 0, x1: 6.5, z0: 0, z1: 17, yard: "east", openings: [[6.6, 9.8], [11.8, 15.6]], slot: [1.0, 1.6] },
  { id: "east", x0: 13.5, x1: 20, z0: 0, z1: 14, yard: "west", openings: [[6.6, 11.2]], slot: null },
];

export const LINK = { x0: 6.5, x1: 13.5, z0: 0, z1: DIM.LINK_Z };

/**
 * Build the model.
 * @param {object} o
 * @param {"foundations"|"structure"|"envelope"|"finish"} o.stage  include layers up to this stage
 * @param {string|null} o.highlight  stage whose objects are outlined in safety orange
 * @param {string|null} o.only  include only this stage (exploded view)
 * @param {number[]} o.offset  translation applied to everything (exploded view)
 * @param {"drawing"|"scene"} o.mode  drawing = paper axonometric, scene = illustrated view
 * @param {number} o.brickSpacing  spacing of coursing lines (m)
 * @param {"drawing"|"raw"} o.palette  raw keeps true material colours (3D export)
 */
export function buildModel({ stage = "finish", highlight = null, only = null, offset = [0, 0, 0], mode = "drawing", brickSpacing = 0.225, theme = "paper", palette = "drawing", cull = true } = {}) {
  // "graphite" draws light linework on a dark plate; "paper" is the default drawing
  const dark = theme === "graphite";
  const INK = dark ? GRAPHITE.ink : PAL.ink;
  const BG = dark ? GRAPHITE.bg : PAL.paper;
  const { SL, EAVE, RIDGE, BEAM, OH_E, OH_G, OH_S, I, T } = DIM;
  const solids = [];
  const ground = [];
  const sprites = [];
  const anchors = [];
  const overlays = [];
  const drawing = mode === "drawing";
  const raw = palette === "raw";
  const col = (c) => (drawing && !raw ? (dark ? E.mix(c === PAL.zinc ? "#50565a" : c, "#7d8380", 0.12) : E.mix(c, BG, 0.18)) : c);

  for (const s of stages) for (const l of s.modelLayers) if (!layerStage[l.id]) throw new Error("bad layer");
  const has = (layer) => {
    const st = layerStage[layer];
    if (!st) throw new Error(`Layer "${layer}" is not declared in content/stages.ts`);
    return only ? st === only : order[st] <= order[stage];
  };
  const isHl = (layer) => highlight && layerStage[layer] === highlight;
  const hlStyle = { stroke: PAL.orange, strokeWidth: 1.7, strokeOpacity: 1 };

  const translate = (s) => {
    if (offset.every((v) => v === 0)) return s;
    for (const f of s.faces) {
      f.pts = f.pts.map((p) => E.add(p, offset));
      for (const d of f.details) d.pts = d.pts.map((p) => E.add(p, offset));
    }
    return s;
  };
  const put = (layer, s, { isGround = false } = {}) => {
    if (!has(layer)) return null;
    s.layer = layer;
    if (isHl(layer)) {
      const tint = drawing && !["site-base", "courtyard-void"].includes(layer);
      for (const f of s.faces) {
        if (f.stroke !== null || f.hlAlways) Object.assign(f, hlStyle, { strokeWidth: (f.strokeWidth ?? 1) < 1 ? 1 : hlStyle.strokeWidth });
        if (tint && f.fill && !f.fill.startsWith("url")) f.fill = E.mix(f.fill, PAL.orange, dark ? 0.42 : 0.3);
      }
    }
    translate(s);
    (isGround ? ground : solids).push(s);
    return s;
  };
  const sprite = (layer, factory, at, opts) => {
    if (!has(layer)) return;
    const sp = factory(E.add(at, offset), { ...opts, highlight: isHl(layer) ? PAL.orange : undefined });
    sp.layer = layer;
    sp.meta = { kind: factory === E.tree ? "tree" : "person", at: E.add(at, offset), ...opts };
    sprites.push(sp);
  };
  const anchor = (layer, id, label, p) => {
    if (has(layer)) anchors.push({ id, label, stage: layerStage[layer], point: E.add(p, offset) });
  };

  const brickLines = (s) => {
    for (const f of s.faces) {
      if (Math.abs(f.normal[1]) > 0.2) continue;
      const drop = Math.abs(f.normal[0]) > 0.5 ? "x" : "z";
      const st = { stroke: PAL.brickLine, strokeOpacity: drawing ? 0.35 : 0.3, strokeWidth: 0.55 };
      f.details.push(...E.hatch(f, { drop, scan: "y", spacing: brickSpacing, offset: SL, style: st }));
      if (!drawing) {
        // staggered perpends so the coursing reads as brick, not boarding
        const along = drop === "x" ? "z" : "x";
        const ai = along === "x" ? 0 : 2;
        const verticals = E.hatch(f, { drop, scan: along, spacing: brickSpacing * 2.25, offset: 0, style: st });
        verticals.forEach((ln, i) => {
          const [a, b] = ln.pts[0][1] < ln.pts[1][1] ? ln.pts : [ln.pts[1], ln.pts[0]];
          let k = 0;
          for (let y = SL; y + brickSpacing <= b[1] + 1e-6; y += brickSpacing, k++) {
            if (y < a[1] - 1e-6 || (k + i) % 2) continue;
            f.details.push({ type: "line", pts: [[a[0], y, a[2]], [a[0], y + brickSpacing, a[2]]], ...st, strokeOpacity: 0.22 });
          }
        });
        void ai;
      }
    }
    return s;
  };
  const glassFill = raw ? PAL.glass : drawing ? "#c4d2d3" : "url(#glass)";
  const glassStyle = (extra = {}) => ({ fill: glassFill, opacity: drawing ? 0.75 : 0.9, stroke: INK, strokeOpacity: 0.6, strokeWidth: 0.8, glass: true, ...extra });

  // ---------------- site base (drawing only) ----------------
  if (drawing && has("site-base")) {
    const base = E.box(-5, -0.8, -5, 25, 0, 22.5, { fill: dark ? GRAPHITE.base : "#e3ded1", flat: false, castShadow: false });
    const top = E.face(base, [0, 1, 0]);
    if (has("setting-out-grid")) {
      const gx = [0, 6.5, 13.5, 20];
      const gz = [0, 4.5, 14, 17];
      const gridStyle = { stroke: isHl("setting-out-grid") ? PAL.orange : INK, strokeOpacity: 0.7, strokeWidth: 0.7, dash: "6 5", layer: "setting-out-grid" };
      for (const x of gx) top.details.push({ type: "line", pts: [[x, 0.01, -3.6], [x, 0.01, 20.6]], ...gridStyle });
      for (const z of gz) top.details.push({ type: "line", pts: [[-3.6, 0.01, z], [23.6, 0.01, z]], ...gridStyle });
      const labels = [
        ...gx.map((x, i) => ({ p: [x, 0.01, -4.3], t: String.fromCharCode(65 + i) })),
        ...gz.map((z, i) => ({ p: [24.3, 0.01, z], t: String(i + 1) })),
      ];
      overlays.push((cam) =>
        labels
          .map(({ p, t }) => {
            const [x, y] = E.project(cam, E.add(p, offset));
            return `<g><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="13" fill="${BG}" stroke="${gridStyle.stroke}" stroke-width="1.2"/><text x="${x.toFixed(
              1,
            )}" y="${(y + 5).toFixed(1)}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',Arial,sans-serif" font-size="15" font-weight="600" fill="${INK}">${t}</text></g>`;
          })
          .join(""),
      );
      anchor("setting-out-grid", "grid", "Setting-out grid", [20, 0, -3.6]);
    }
    put("site-base", base, { isGround: true });
  }

  // ---------------- foundations ----------------
  for (const w of WINGS) {
    put("ground-slab", E.box(w.x0, 0, w.z0, w.x1, SL, w.z1, { fill: col(PAL.concrete) }));
  }
  put("ground-slab", E.box(LINK.x0, 0, LINK.z0, LINK.x1, SL, LINK.z1, { fill: col(PAL.concrete) }));
  anchor("ground-slab", "slab", "Insulated ground slab", [3.25, SL, 8]);

  if (drawing && has("courtyard-void")) {
    const v = E.plane(
      [
        [LINK.x0, 0.02, LINK.z1],
        [LINK.x1, 0.02, LINK.z1],
        [LINK.x1, 0.02, 17],
        [LINK.x0, 0.02, 17],
      ],
      { fill: drawing ? (dark ? GRAPHITE.void : "#ebe6da") : "#b9bfa0", flat: true, stroke: isHl("courtyard-void") ? PAL.orange : INK, dash: "7 5", strokeWidth: 1.2, hlAlways: true },
    );
    if (drawing) v.faces[0].details.push(...E.hatch(v.faces[0], { drop: "y", scan: "x", spacing: 0.7, offset: 0.35, style: { stroke: INK, strokeOpacity: 0.18, strokeWidth: 0.6 } }));
    put("courtyard-void", v, { isGround: true });
    anchor("courtyard-void", "void", "Courtyard void", [10, 0, 11]);
  }

  // ---------------- per-wing structure, envelope and finish ----------------
  for (const w of WINGS) {
    const { x0, x1, z0, z1 } = w;
    const xm = (x0 + x1) / 2;
    const slope = (RIDGE - EAVE) / (xm - x0);
    const u = (x) => EAVE + (x <= xm ? x - x0 : x1 - x) * slope; // rafter underside
    const yardX = w.yard === "east" ? x1 : x0; // outer face on the courtyard side
    const yardDir = w.yard === "east" ? 1 : -1;
    const otherX = w.yard === "east" ? x0 : x1;
    const zStartYard = DIM.LINK_Z;

    // --- structure: blockwork inner leaf ---
    const innerStyle = { fill: col(PAL.block) };
    const cavityCull = (sol) => {
      if (!cull || !has("brick-outer-leaf") || only) return sol;
      sol.faces = sol.faces.filter((f) => {
        if (Math.abs(f.normal[1]) > 0.5) return true;
        const p = E.add(E.centroid(f.pts), E.mul(f.normal, 0.06));
        return !(p[0] < x0 + I - 0.001 || p[0] > x1 - I + 0.001 || p[2] < z0 + I - 0.001);
      });
      return sol;
    };
    const longInner = (outerX, dir, zs) => {
      const xa = outerX - dir * I;
      const xb = xa - dir * T;
      return E.box(Math.min(xa, xb), SL, zs, Math.max(xa, xb), u(Math.min(xa, xb) + (dir > 0 ? 0 : T)), z1 - I, innerStyle);
    };
    put("blockwork-inner-leaf", cavityCull(longInner(otherX, -yardDir, z0 + I)));
    const yardInner = longInner(yardX, yardDir, zStartYard);
    if (has("blockwork-inner-leaf") && !has("brick-outer-leaf")) {
      const fx = yardX - yardDir * I;
      const fc = E.face(yardInner, [yardDir, 0, 0]);
      for (const [za, zb] of w.openings) E.decal(fc, E.rectOn("x", fx, za, zb, SL, 2.5, yardDir), { fill: PAL.void, opacity: 0.85, stroke: null });
    }
    put("blockwork-inner-leaf", cavityCull(yardInner));

    const gable = (zA, yBottom) =>
      E.extrude(
        [
          [x0 + I, yBottom, zA],
          [x1 - I, yBottom, zA],
          [x1 - I, u(x1 - I), zA],
          [xm, RIDGE, zA],
          [x0 + I, u(x0 + I), zA],
        ],
        [0, 0, T],
        innerStyle,
      );
    put("blockwork-inner-leaf", cavityCull(gable(z0 + I, SL)));
    put("blockwork-inner-leaf", cavityCull(gable(z1 - I - T, BEAM)));
    if (w.id === "east") anchor("blockwork-inner-leaf", "block", "Blockwork inner leaf", [x1 - I, 1.6, (z0 + z1) / 2]);

    // --- structure: steel goalpost over the garden opening ---
    const zs0 = z1 - I - T - 0.04;
    const zs1 = z1 - I + 0.04;
    const steel = { fill: drawing ? col(PAL.steel) : PAL.plaster, flat: false };
    put("steel-goalpost-frames", E.box(x0 + I, BEAM - 0.3, zs0, x1 - I, BEAM, zs1, steel));
    put("steel-goalpost-frames", E.box(x0 + I + T, SL, zs0, x0 + I + T + 0.2, BEAM - 0.3, zs1, steel));
    put("steel-goalpost-frames", E.box(x1 - I - T - 0.2, SL, zs0, x1 - I - T, BEAM - 0.3, zs1, steel));
    if (w.id === "west") anchor("steel-goalpost-frames", "goalpost", "Steel goalpost frame", [xm, BEAM - 0.15, zs1]);

    // --- structure: roof timbers ---
    const timber = { fill: col(PAL.softwood) };
    put("roof-timbers", E.box(xm - 0.08, RIDGE - 0.1, z0 - OH_S, xm + 0.08, RIDGE + 0.2, z1 + OH_G, timber));
    for (let z = z0 - OH_S + 0.05; z <= z1 + OH_G - 0.05; z += 0.9) {
      for (const side of [-1, 1]) {
        // no rafter tails where the wing meets the lower link roof
        const overLink = z < DIM.LINK_Z + 0.2 && (side > 0) === (w.yard === "east");
        const oh = overLink ? -0.1 : OH_E;
        const xe = side < 0 ? x0 - oh : x1 + oh;
        const ye = EAVE - oh * slope;
        put(
          "roof-timbers",
          E.extrude(
            [
              [xe, ye, z],
              [xm, RIDGE, z],
              [xm, RIDGE + 0.2, z],
              [xe, ye + 0.2, z],
            ],
            [0, 0, 0.05],
            { ...timber, strokeWidth: 0.6, bias: has("zinc-roof") ? 3 : 0 },
          ),
        );
      }
    }
    if (w.id === "west") anchor("roof-timbers", "rafters", "Ridge beam and rafters", [x1 - 1.6, u(x1 - 1.6) + 0.2, 6]);

    // --- envelope: brick outer leaf ---
    const brick = { fill: col(PAL.brick) };
    const outerLong = brickLines(E.box(Math.min(otherX, otherX - yardDir * 0.1), SL, z0, Math.max(otherX, otherX - yardDir * 0.1), EAVE, z1, brick));
    put("brick-outer-leaf", outerLong);
    const yardLong = brickLines(E.box(Math.min(yardX, yardX - yardDir * 0.1), SL, zStartYard, Math.max(yardX, yardX - yardDir * 0.1), EAVE, z1, brick));
    if (has("brick-outer-leaf")) {
      const fc = E.face(yardLong, [yardDir, 0, 0]);
      const fin = has("oak-joinery");
      for (const [za, zb] of w.openings) {
        E.decal(fc, E.rectOn("x", yardX, za, zb, SL, 2.5, yardDir), glassStyle({ stroke: fin ? PAL.oak : INK, strokeWidth: fin ? 2.4 : 0.8, strokeOpacity: 1 }));
        const mid = (za + zb) / 2;
        fc.details.push({ type: "line", pts: [[yardX + yardDir * 0.012, SL, mid], [yardX + yardDir * 0.012, 2.5, mid]], stroke: fin ? PAL.oak : INK, strokeWidth: fin ? 2 : 0.7, strokeOpacity: 1 });
      }
    }
    put("brick-outer-leaf", yardLong);

    const streetGable = brickLines(
      E.extrude(
        [
          [x0, SL, z0],
          [x1, SL, z0],
          [x1, EAVE + 0.2, z0],
          [xm, RIDGE + 0.2, z0],
          [x0, EAVE + 0.2, z0],
        ],
        [0, 0, 0.1],
        brick,
      ),
    );
    if (w.slot && has("brick-outer-leaf")) {
      const fc = E.face(streetGable, [0, 0, -1]);
      const [a, b] = w.slot;
      E.decal(fc, E.rectOn("z", z0, x0 + a, x0 + b, 0.9, 2.7, -1), glassStyle({ stroke: has("oak-joinery") ? PAL.oak : INK, strokeWidth: has("oak-joinery") ? 2 : 0.8 }));
    }
    put("brick-outer-leaf", streetGable);
    put(
      "brick-outer-leaf",
      brickLines(
        E.extrude(
          [
            [x0 + 0.1, BEAM, z1 - 0.1],
            [x1 - 0.1, BEAM, z1 - 0.1],
            [x1 - 0.1, u(x1 - 0.1) + 0.2, z1 - 0.1],
            [xm, RIDGE + 0.2, z1 - 0.1],
            [x0 + 0.1, u(x0 + 0.1) + 0.2, z1 - 0.1],
          ],
          [0, 0, 0.1],
          brick,
        ),
      ),
    );
    if (w.id === "east") anchor("brick-outer-leaf", "brick", "Pale buff brick", [x0 + 1.4, 3.05, z1]);

    // --- envelope: glazing to the garden ---
    const gz = z1 - 0.16;
    const screen = E.plane(
      [
        [x0 + 0.1, SL, gz],
        [x1 - 0.1, SL, gz],
        [x1 - 0.1, BEAM, gz],
        [x0 + 0.1, BEAM, gz],
      ],
      glassStyle(),
    );
    if (!has("oak-joinery")) {
      const wdt = x1 - x0 - 0.2;
      for (let k = 1; k < 4; k++) screen.faces[0].details.push({ type: "line", pts: [[x0 + 0.1 + (wdt * k) / 4, SL, gz + 0.01], [x0 + 0.1 + (wdt * k) / 4, BEAM, gz + 0.01]], stroke: INK, strokeWidth: 0.9, strokeOpacity: 0.8 });
    }
    screen.faces[0].bias = -0.02;
    put("glazing", screen);
    if (w.id === "west") anchor("glazing", "glazing", "Glazed garden screen", [x0 + 2.2, 1.4, gz]);

    // --- envelope: zinc roof ---
    const ye = EAVE - OH_E * slope + 0.2;
    const roofProfile = [
      [x0 - OH_E, ye, 0],
      [xm, RIDGE + 0.2, 0],
      [x1 + OH_E, ye, 0],
      [x1 + OH_E, ye + 0.12, 0],
      [xm, RIDGE + 0.32, 0],
      [x0 - OH_E, ye + 0.12, 0],
    ].map(([x, y]) => [x, y, z0 - OH_S]);
    const roof = E.extrude(roofProfile, [0, 0, z1 + OH_G - (z0 - OH_S)], {
      fill: col(PAL.zinc),
      bias: drawing ? -1.5 : -1,
      faceStyle: (f) => {
        const n = E.newell(f.pts);
        if (n[1] < -0.5) return { fill: col(PAL.sarking) };
        if (Math.abs(n[2]) > 0.9) return { fill: E.shade(PAL.zinc, 0.92) };
        return null;
      },
    });
    if (has("zinc-roof")) {
      for (const f of roof.faces) {
        if (f.normal[1] > 0.5) f.details.push(...E.hatch(f, { drop: "y", scan: "z", spacing: 0.5, offset: 0.2, style: { stroke: "#8b9194", strokeOpacity: 0.55, strokeWidth: 0.7 } }));
      }
    }
    put("zinc-roof", roof);
    if (w.id === "west") anchor("zinc-roof", "zinc", "Standing-seam zinc", [x1 - 1.5, u(x1 - 1.5) + 0.34, 10]);

    // --- finish: timber soffit under the garden overhang ---
    const soffit = E.extrude(
      [
        [x0 - OH_E, EAVE - OH_E * slope - 0.04, z1],
        [xm, RIDGE - 0.04, z1],
        [x1 + OH_E, EAVE - OH_E * slope - 0.04, z1],
        [x1 + OH_E, EAVE - OH_E * slope, z1],
        [xm, RIDGE, z1],
        [x0 - OH_E, EAVE - OH_E * slope, z1],
      ],
      [0, 0, OH_G],
      { fill: PAL.oak },
    );
    soffit.faces = soffit.faces.filter((f) => f.normal[1] < 0.3);
    if (has("timber-soffits")) {
      for (const f of soffit.faces)
        if (f.normal[1] < -0.5) f.details.push(...E.hatch(f, { drop: "y", scan: "x", spacing: 0.16, offset: 0.08, style: { stroke: "#6f5233", strokeOpacity: 0.45, strokeWidth: 0.6 } }));
    }
    put("timber-soffits", soffit);
    if (w.id === "west") anchor("timber-soffits", "soffit", "Oak-lined soffit", [x0 + 1.4, u(x0 + 1.4) - 0.05, z1 + 0.9]);

    // --- finish: oak frames to the garden screen ---
    const oak = { fill: PAL.oak };
    const wdt = x1 - x0 - 0.2;
    for (let k = 0; k <= 4; k++) {
      const x = x0 + 0.1 + (wdt * k) / 4;
      put("oak-joinery", E.box(x - 0.05, SL, gz - 0.02, x + 0.05, BEAM, gz + 0.08, oak));
    }
    put("oak-joinery", E.box(x0 + 0.1, BEAM - 0.1, gz - 0.02, x1 - 0.1, BEAM, gz + 0.08, oak));
    if (w.id === "west") anchor("oak-joinery", "oak", "Oak frames", [x0 + 0.1 + wdt / 4, 1.2, gz + 0.08]);

    // --- finish: interior ---
    const fx0 = x0 + I + T;
    const fx1 = x1 - I - T;
    const floor = E.plane(
      [
        [fx0, SL + 0.005, z0 + I + T],
        [fx1, SL + 0.005, z0 + I + T],
        [fx1, SL + 0.005, z1 - 0.17],
        [fx0, SL + 0.005, z1 - 0.17],
      ],
      { fill: PAL.oakFloor, stroke: null, doubleSided: false },
    );
    if (has("interior-finishes")) floor.faces[0].details.push(...E.hatch(floor.faces[0], { drop: "y", scan: "x", spacing: 0.22, style: { stroke: "#8a6a45", strokeOpacity: 0.3, strokeWidth: 0.5 } }));
    floor.faces[0].bias = 1;
    put("interior-finishes", floor);
  }

  // furniture, visible through the garden screens
  put("interior-finishes", E.box(1.4, 0.2, 13.4, 4.6, 0.62, 14.3, { fill: "#8d9a84" })); // sofa
  put("interior-finishes", E.box(1.4, 0.62, 14.05, 4.6, 0.95, 14.3, { fill: "#7f8c77" }));
  put("interior-finishes", E.box(15.2, 0.2, 7.8, 18.4, 0.95, 8.8, { fill: "#e7e2d6" })); // kitchen island
  put("interior-finishes", E.box(15.4, 0.95, 10.6, 18.1, 1.0, 11.6, { fill: PAL.oak })); // table top
  put("interior-finishes", E.box(15.5, 0.2, 10.7, 15.6, 0.95, 10.8, { fill: PAL.oak }));
  put("interior-finishes", E.box(18.0, 0.2, 11.4, 17.9, 0.95, 11.5, { fill: PAL.oak }));

  // ---------------- link ----------------
  {
    const { x0, x1, z0, z1 } = LINK;
    const linkInner = E.box(x0 - 0.2, SL, z0 + I, x1 + 0.2, EAVE, z0 + I + T, { fill: col(PAL.block) });
    if (cull && has("brick-outer-leaf") && !only) linkInner.faces = linkInner.faces.filter((f) => f.normal[2] > -0.5);
    put("blockwork-inner-leaf", linkInner);
    put("steel-goalpost-frames", E.box(x0 - 0.2, 2.75, z1 - 0.22, x1 + 0.2, EAVE, z1 - 0.1, { fill: drawing ? col(PAL.steel) : PAL.plaster }));
    for (let x = x0 + 0.3; x < x1; x += 0.7) put("roof-timbers", E.box(x, EAVE, z0 + 0.2, x + 0.06, EAVE + 0.18, z1 - 0.1, { fill: col(PAL.softwood), strokeWidth: 0.6, bias: has("zinc-roof") ? 1.5 : 0 }));

    const north = brickLines(E.box(x0, SL, z0, x1, EAVE + 0.18, z0 + 0.1, { fill: PAL.brick }));
    if (has("brick-outer-leaf")) {
      const fc = E.face(north, [0, 0, -1]);
      const fin = has("oak-joinery");
      E.decal(fc, E.rectOn("z", z0, 8.6, 10.1, SL, 2.45, -1), { fill: fin ? PAL.oak : PAL.void, opacity: 1, stroke: INK, strokeWidth: 0.9 });
      if (fin) {
        for (let x = 8.8; x < 10.0; x += 0.18) fc.details.push({ type: "line", pts: [[x, SL + 0.1, z0 - 0.012], [x, 2.35, z0 - 0.012]], stroke: "#6f5233", strokeWidth: 0.6, strokeOpacity: 0.6 });
        fc.details.push({ type: "line", pts: [[9.9, 1.0, z0 - 0.015], [9.9, 1.4, z0 - 0.015]], stroke: INK, strokeWidth: 1.6, strokeOpacity: 1 });
      }
      E.decal(fc, E.rectOn("z", z0, 10.6, 12.9, 1.75, 2.45, -1), glassStyle({ stroke: fin ? PAL.oak : INK, strokeWidth: fin ? 2 : 0.8 }));
    }
    put("brick-outer-leaf", north);
    anchor("brick-outer-leaf", "entrance", "Entrance in the link", [9.35, 1.3, z0]);

    const screen = E.plane(
      [
        [x0, SL, z1 - 0.05],
        [x1, SL, z1 - 0.05],
        [x1, 2.75, z1 - 0.05],
        [x0, 2.75, z1 - 0.05],
      ],
      glassStyle(),
    );
    put("glazing", screen);
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 5) put("oak-joinery", E.box(x - 0.05, SL, z1 - 0.08, x + 0.05, 2.75, z1, { fill: PAL.oak }));

    const lroof = E.box(x0, EAVE + 0.18, z0 - 0.15, x1, EAVE + 0.32, z1 + 0.15, { fill: col(PAL.zinc), bias: drawing ? -1.5 : -0.3 });
    if (has("zinc-roof")) {
      const top = E.face(lroof, [0, 1, 0]);
      top.details.push(...E.hatch(top, { drop: "y", scan: "x", spacing: 0.5, offset: 0.25, style: { stroke: "#8b9194", strokeOpacity: 0.5, strokeWidth: 0.7 } }));
    }
    put("zinc-roof", lroof);
  }

  // ---------------- finish: courtyard, terraces and planting ----------------
  const paving = (x0, z0, x1, z1, spacing = 0.6) => {
    const p = E.plane(
      [
        [x0, 0.04, z0],
        [x1, 0.04, z0],
        [x1, 0.04, z1],
        [x0, 0.04, z1],
      ],
      { fill: PAL.stone, flat: !drawing, stroke: INK, strokeOpacity: 0.35, strokeWidth: 0.6 },
    );
    const st = { stroke: "#8e8471", strokeOpacity: 0.45, strokeWidth: 0.5 };
    p.faces[0].details.push(...E.hatch(p.faces[0], { drop: "y", scan: "x", spacing, offset: x0, style: st }));
    p.faces[0].details.push(...E.hatch(p.faces[0], { drop: "y", scan: "z", spacing: spacing * 1.5, offset: z0, style: st }));
    p.faces[0].bias = -0.5;
    return p;
  };
  put("courtyard-planting", paving(LINK.x0, LINK.z1, LINK.x1, 16.4), { isGround: true });
  put("courtyard-planting", paving(-0.6, 17, 7.2, 19.4), { isGround: true });
  put("courtyard-planting", paving(12.8, 14, 20.6, 16.4), { isGround: true });

  const bed = { fill: "#5f6e49" };
  const bedEdge = { fill: PAL.oak };
  put("courtyard-planting", E.box(6.55, 0, 5.4, 7.7, 0.32, 15.2, bedEdge));
  put("courtyard-planting", E.box(6.6, 0.32, 5.45, 7.65, 0.36, 15.15, bed));
  put("courtyard-planting", E.box(12.3, 0, 5.4, 13.45, 0.32, 12.6, bedEdge));
  put("courtyard-planting", E.box(12.35, 0.32, 5.45, 13.4, 0.36, 12.55, bed));
  put("courtyard-planting", E.box(8.7, 0, 13.6, 10.9, 0.45, 14.1, { fill: PAL.oak })); // bench
  anchor("courtyard-planting", "courtyard", "Planted courtyard", [10, 0.2, 9]);

  E.reseed(42);
  sprite("courtyard-planting", E.tree, [10.2, 0, 9.6], { height: 6.4, spread: 2.5, stems: 3, colour: "#76875a", lineScale: drawing ? 1 : 1.2 });
  for (const [x, z] of [[7.1, 6.4], [7.1, 9.2], [7.1, 12.6], [12.9, 7.0], [12.9, 10.8]]) {
    sprite("courtyard-planting", E.tree, [x, 0.35, z], { height: 1.3, spread: 0.9, colour: "#6b7d50", trunk: "#5f6e49", lineScale: 0.8 });
  }
  sprite("courtyard-planting", E.person, [9.4, 0.45, 13.85], { seated: true, colour: "#9a5b3f" });
  sprite("courtyard-planting", E.person, [3.6, 0.04, 18.4], { colour: "#3d4a52" });
  sprite("courtyard-planting", E.person, [4.5, 0.04, 18.9], { child: true, colour: "#c9773f" });

  return { solids, ground, sprites, anchors, overlays };
}

/** Points that bound the whole model, used to frame drawings consistently. */
export function boundsPoints() {
  const pts = [];
  for (const x of [-5, 25]) for (const z of [-5, 22.5]) for (const y of [-0.8, 7]) pts.push([x, y, z]);
  return pts;
}

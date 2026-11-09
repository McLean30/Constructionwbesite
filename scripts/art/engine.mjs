// A small, dependency-free vector renderer for architectural drawings.
// Geometry is described as planar faces in metres (x east, y up, z south).
// Faces are culled, depth sorted (painter's algorithm) and written to SVG.

// ---------- vector maths ----------
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => mul(a, 1 / (len(a) || 1));
export const centroid = (pts) => mul(pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / pts.length);

export function newell(pts) {
  let n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    n = add(n, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]);
  }
  return norm(n);
}

// ---------- colour ----------
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
export function shade(hex, f) {
  return rgbToHex(hexToRgb(hex).map((v) => v * f));
}
export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

// ---------- solids ----------
/**
 * Extrude a planar polygon along `vec`. Returns an object with outward-facing faces.
 * style: { fill, stroke, opacity, layer, ... } applied to every face; `faceStyle(kind, i)` may override.
 */
export function extrude(poly, vec, style = {}) {
  let P = poly.map((p) => [...p]);
  if (dot(newell(P), vec) > 0) P = P.reverse();
  const top = P.map((p) => add(p, vec));
  const faces = [];
  faces.push({ pts: P, kind: "base" });
  faces.push({ pts: [...top].reverse(), kind: "cap" });
  for (let i = 0; i < P.length; i++) {
    const j = (i + 1) % P.length;
    faces.push({ pts: [P[i], top[i], top[j], P[j]], kind: "side", index: i });
  }
  return solid(faces, style);
}

export function box(x0, y0, z0, x1, y1, z1, style = {}) {
  return extrude(
    [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
    ],
    [0, y1 - y0, 0],
    style,
  );
}

/** A single (optionally double-sided) planar face. */
export function plane(pts, style = {}) {
  return solid([{ pts, kind: "plane" }], { doubleSided: true, castShadow: false, ...style });
}

function solid(faces, style) {
  const { faceStyle, ...rest } = style;
  const s = {
    castShadow: true,
    ...rest,
    faces: faces.map((f) => {
      const over = faceStyle ? faceStyle(f) || {} : {};
      return { ...rest, ...f, ...over, normal: newell(f.pts), details: [] };
    }),
  };
  s.faces.forEach((f) => (f.solid = s));
  return s;
}

/** Find the face of a solid whose normal is closest to `n` (optionally nearest a point). */
export function face(s, n, near) {
  let best = null;
  let bestScore = -Infinity;
  for (const f of s.faces) {
    let score = dot(f.normal, norm(n));
    if (score < 0.8) continue;
    if (near) score -= Math.abs(dot(f.normal, sub(centroid(f.pts), near))) * 10;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  if (!best) throw new Error("face not found");
  return best;
}

// ---------- decals ----------
const AX = { x: 0, y: 1, z: 2 };

/**
 * Hatch a face with parallel lines. `drop` is the axis discarded to work in 2D,
 * `scan` is the axis held constant along each line. Returns detail lines in 3D.
 */
export function hatch(f, { drop, scan, spacing, offset = 0, inset = 0, style = {} }) {
  const d = AX[drop];
  const s = AX[scan];
  const o = [0, 1, 2].find((i) => i !== d && i !== s);
  const n = f.normal;
  const p0 = f.pts[0];
  const planeD = dot(n, p0);
  if (Math.abs(n[d]) < 1e-6) return [];
  const pts2 = f.pts.map((p) => [p[s], p[o]]);
  const sMin = Math.min(...pts2.map((p) => p[0]));
  const sMax = Math.max(...pts2.map((p) => p[0]));
  const lines = [];
  const start = Math.ceil((sMin + inset - offset) / spacing) * spacing + offset;
  for (let v = start; v <= sMax - inset + 1e-9; v += spacing) {
    const xs = [];
    for (let i = 0; i < pts2.length; i++) {
      const a = pts2[i];
      const b = pts2[(i + 1) % pts2.length];
      if ((a[0] <= v && b[0] > v) || (b[0] <= v && a[0] > v)) {
        const t = (v - a[0]) / (b[0] - a[0]);
        xs.push(a[1] + t * (b[1] - a[1]));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const seg = [xs[i] + inset, xs[i + 1] - inset].map((ov) => {
        const p = [0, 0, 0];
        p[s] = v;
        p[o] = ov;
        p[d] = (planeD - n[s] * p[s] - n[o] * p[o]) / n[d];
        return add(p, mul(n, 0.003));
      });
      if (seg[1][o] > seg[0][o] || true) lines.push({ type: "line", pts: seg, ...style });
    }
  }
  return lines;
}

/** Axis-aligned rectangle lying on plane `axis = c`, lifted slightly along `dir`. */
export function rectOn(axis, c, a0, a1, b0, b1, dir = 1, lift = 0.01) {
  const cc = c + dir * lift;
  if (axis === "x") return [[cc, b0, a0], [cc, b0, a1], [cc, b1, a1], [cc, b1, a0]];
  if (axis === "z") return [[a0, b0, cc], [a1, b0, cc], [a1, b1, cc], [a0, b1, cc]];
  return [[a0, cc, b0], [a1, cc, b0], [a1, cc, b1], [a0, cc, b1]];
}

export function decal(f, pts, style) {
  f.details.push({ type: "poly", pts, ...style });
}

// ---------- cameras ----------
export function perspective({ pos, target, fov, width, height }) {
  const f = norm(sub(target, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const focal = height / 2 / Math.tan((fov * Math.PI) / 360);
  const toCam = (p) => {
    const d = sub(p, pos);
    return [dot(d, r), dot(d, u), dot(d, f)];
  };
  return {
    kind: "perspective",
    width,
    height,
    pos,
    forward: f,
    focal,
    toCam,
    near: 0.3,
    screen: ([x, y, z]) => [width / 2 + (x / z) * focal, height / 2 - (y / z) * focal],
    visible: (fc) => dot(fc.normal, sub(pos, centroid(fc.pts))) > 0,
    depth: (p) => len(sub(p, pos)),
    scaleAt: (p) => focal / Math.max(0.3, toCam(p)[2]),
  };
}

export function orthographic({ dir, width, height, scale = 1, centre = [0, 0, 0], shift = [0, 0] }) {
  const back = norm(dir); // from scene toward viewer
  const f = mul(back, -1);
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const cam = {
    kind: "orthographic",
    width,
    height,
    forward: f,
    near: -Infinity,
    scale,
    centre,
    shift,
    toCam: (p) => {
      const d = sub(p, cam.centre);
      return [dot(d, r), dot(d, u), dot(d, f)];
    },
    screen: ([x, y]) => [cam.width / 2 + cam.shift[0] + x * cam.scale, cam.height / 2 + cam.shift[1] - y * cam.scale],
    visible: (fc) => dot(fc.normal, back) > 0,
    depth: (p) => dot(sub(p, cam.centre), f),
    scaleAt: () => cam.scale,
  };
  return cam;
}

/** Fit an orthographic camera so that `points` fill the frame with `margin` px. */
export function fitOrtho(cam, points, margin = 60) {
  cam.scale = 1;
  cam.centre = [0, 0, 0];
  cam.shift = [0, 0];
  const proj = points.map((p) => cam.toCam(p));
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  cam.scale = Math.min((cam.width - margin * 2) / w, (cam.height - margin * 2) / h);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  cam.shift = [-cx * cam.scale, cy * cam.scale];
  return cam;
}

// ---------- projection helpers ----------
function clipNear(camPts, near) {
  if (near === -Infinity) return camPts;
  const out = [];
  for (let i = 0; i < camPts.length; i++) {
    const a = camPts[i];
    const b = camPts[(i + 1) % camPts.length];
    const ain = a[2] >= near;
    const bin = b[2] >= near;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (near - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]);
    }
  }
  return out;
}

export function projectPoly(cam, pts) {
  const c = clipNear(pts.map(cam.toCam), cam.near);
  return c.map(cam.screen);
}

export function project(cam, p) {
  return cam.screen(cam.toCam(p));
}

const r1 = (v) => Math.round(v * 10) / 10;
export const pathOf = (pts2, close = true) =>
  pts2.length ? "M" + pts2.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L") + (close ? "Z" : "") : "";

// ---------- shadows ----------
function hull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const crossZ = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && crossZ(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && crossZ(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export function shadowPolys(solids, light, groundY = 0) {
  const L = norm(light);
  return solids
    .filter((s) => s.castShadow)
    .map((s) => {
      const pts = s.faces.flatMap((f) => f.pts).filter((p) => p[1] >= groundY - 1e-6);
      const flat = pts.map((p) => {
        const t = (p[1] - groundY) / L[1];
        return [p[0] - L[0] * t, p[2] - L[2] * t];
      });
      return hull(flat).map(([x, z]) => [x, groundY + 0.004, z]);
    });
}

// ---------- rendering ----------
/**
 * Render a scene to SVG markup.
 * scene: { solids, sprites, groundSolids, light, ambient, diffuse, edge, edgeWidth, shadow, background, overlay }
 */
export function render(cam, scene) {
  const {
    solids = [],
    groundSolids = [],
    sprites = [],
    light = [0.5, 0.8, 0.6],
    ambient = 0.72,
    diffuse = 0.32,
    edge = "#202421",
    edgeWidth = 1,
    edgeOpacity = 0.75,
    shadow = null,
    background = "",
    overlay = "",
    defs = "",
  } = scene;
  const L = norm(light);
  const out = [];

  const faceSvg = (f) => {
    const p = projectPoly(cam, f.pts);
    if (p.length < 3) return "";
    let fill = f.fill || "#cccccc";
    if (!f.flat && !fill.startsWith("url")) {
      const lit = ambient + diffuse * Math.max(0, dot(f.normal, L)) - (f.normal[1] < -0.5 ? 0.12 : 0);
      fill = shade(fill, lit);
    }
    const stroke = f.stroke === undefined ? edge : f.stroke;
    const sw = (f.strokeWidth ?? 1) * edgeWidth;
    let s = `<path d="${pathOf(p)}" fill="${fill}"${f.opacity != null ? ` fill-opacity="${f.opacity}"` : ""}${
      stroke ? ` stroke="${stroke}" stroke-width="${r1(sw)}" stroke-opacity="${f.strokeOpacity ?? edgeOpacity}" stroke-linejoin="round"` : ""
    }${f.dash ? ` stroke-dasharray="${f.dash}"` : ""}/>`;
    for (const d of f.details) s += detailSvg(d);
    return s;
  };

  const detailSvg = (d) => {
    if (d.type === "line") {
      const c = d.pts.map(cam.toCam);
      if (cam.near !== -Infinity && (c[0][2] < cam.near || c[1][2] < cam.near)) return "";
      const p = c.map(cam.screen);
      return `<path d="${pathOf(p, false)}" stroke="${d.stroke || edge}" stroke-width="${r1(
        (d.strokeWidth ?? 0.6) * edgeWidth,
      )}" stroke-opacity="${d.strokeOpacity ?? 0.5}" fill="none"${d.dash ? ` stroke-dasharray="${d.dash}"` : ""} stroke-linecap="round"/>`;
    }
    const p = projectPoly(cam, d.pts);
    if (p.length < 3) return "";
    const stroke = d.stroke === undefined ? edge : d.stroke;
    return `<path d="${pathOf(p)}" fill="${d.fill || "none"}"${d.opacity != null ? ` fill-opacity="${d.opacity}"` : ""}${
      stroke ? ` stroke="${stroke}" stroke-width="${r1((d.strokeWidth ?? 0.8) * edgeWidth)}" stroke-opacity="${d.strokeOpacity ?? 0.7}" stroke-linejoin="round"` : ""
    }${d.dash ? ` stroke-dasharray="${d.dash}"` : ""}/>`;
  };

  const collect = (list) =>
    list.flatMap((s) =>
      s.faces
        .filter((f) => f.doubleSided || cam.visible(f))
        .map((f) => ({ depth: cam.depth(centroid(f.pts)) + (f.bias || 0) + (s.bias || 0), svg: () => faceSvg(f) })),
    );

  // ground surfaces
  const ground = collect(groundSolids).sort((a, b) => b.depth - a.depth);
  out.push(background);
  out.push(...ground.map((g) => g.svg()));

  // shadows
  if (shadow) {
    const polys = shadowPolys(solids, shadow.light || light, shadow.groundY || 0);
    out.push(
      `<g fill="${shadow.colour || "#202421"}" opacity="${shadow.opacity ?? 0.16}"${shadow.filter ? ` filter="${shadow.filter}"` : ""}>` +
        polys.map((p) => `<path d="${pathOf(projectPoly(cam, p))}"/>`).join("") +
        "</g>",
    );
  }

  const items = collect(solids).concat(
    sprites.map((sp) => ({ depth: cam.depth(sp.at) + (sp.bias || 0), svg: () => sp.draw(cam) })),
  );
  items.sort((a, b) => b.depth - a.depth);
  out.push(...items.map((i) => i.svg()));
  out.push(overlay);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cam.width} ${cam.height}" width="${cam.width}" height="${cam.height}">${
    defs ? `<defs>${defs}</defs>` : ""
  }${out.join("")}</svg>`;
}

// ---------- sprites ----------
let seed = 7;
export function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
export function reseed(s) {
  seed = s;
}

/** A tree drawn as a loose cluster of foliage clumps with stems, billboarded at `at` (ground point). */
export function tree(at, { height = 6, spread = 2.4, colour = "#6f7f55", trunk = "#5b4f43", stems = 1, edge = "#202421", lineScale = 1, highlight } = {}) {
  const s0 = rand() * 1000;
  return {
    at: add(at, [0, Math.min(height * 0.5, 2.5), 0]),
    draw(cam) {
      reseed(Math.floor(s0) + 11);
      const base = project(cam, at);
      const k = cam.scaleAt(at);
      const crownY = base[1] - height * 0.6 * k;
      const crownR = spread * k;
      let s = "";
      for (let i = 0; i < stems; i++) {
        const dx = (i - (stems - 1) / 2) * 0.45 * k;
        s += `<path d="M${r1(base[0] + dx * 0.25)} ${r1(base[1])}Q${r1(base[0] + dx * 0.8)} ${r1(base[1] - height * 0.3 * k)} ${r1(
          base[0] + dx * 1.8,
        )} ${r1(crownY + crownR * 0.2)}" stroke="${trunk}" stroke-width="${r1(Math.max(1, (stems > 1 ? 0.1 : 0.16) * k))}" fill="none" stroke-linecap="round"/>`;
      }
      const clumps = Math.max(8, Math.round(14 + spread * 4));
      const pts = [];
      for (let i = 0; i < clumps; i++) {
        const a = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * 0.78;
        pts.push({
          x: base[0] + Math.cos(a) * rr * crownR,
          y: crownY - height * 0.14 * k + Math.sin(a) * rr * crownR * 0.82,
          r: crownR * (0.22 + rand() * 0.2),
          t: rand(),
        });
      }
      // darker clumps behind and lower, lighter on top-left
      pts.sort((a, b) => b.y - a.y);
      for (const p of pts) {
        const lightness = (base[1] - p.y) / (height * k);
        const tone = p.t < 0.3 ? mix(colour, "#202421", 0.22) : p.t > 0.75 ? mix(colour, "#f4f1e9", 0.16) : mix(colour, "#202421", 0.08 - lightness * 0.06);
        s += `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${r1(p.r)}" fill="${tone}" fill-opacity="0.94"${
          highlight ? ` stroke="${highlight}" stroke-width="${r1(1.2 * lineScale)}"` : lineScale < 1.1 ? ` stroke="${edge}" stroke-opacity="0.18" stroke-width="${r1(0.7 * lineScale)}"` : ""
        }/>`;
      }
      return `<g>${s}</g>`;
    },
  };
}

/** A simple human figure, standing or seated, for scale. */
export function person(at, { height = 1.72, colour = "#3d4a52", skin = "#c99a7a", seated = false, facing = 1, child = false } = {}) {
  return {
    at: add(at, [0, 0.8, 0]),
    bias: -0.05,
    draw(cam) {
      const feet = project(cam, at);
      const k = cam.scaleAt(at);
      const h = (child ? 1.15 : height) * k * (seated ? 0.72 : 1);
      const w = h * 0.24;
      const x = feet[0];
      const y = feet[1];
      const head = h * 0.075;
      const legs = seated
        ? `<path d="M${r1(x - w * 0.25)} ${r1(y - h * 0.42)}L${r1(x + w * 0.9 * facing)} ${r1(y - h * 0.42)}L${r1(x + w * 0.9 * facing)} ${r1(y)}" stroke="#2c3236" stroke-width="${r1(
            w * 0.32,
          )}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`
        : `<path d="M${r1(x - w * 0.18)} ${r1(y - h * 0.45)}L${r1(x - w * 0.22)} ${r1(y)}M${r1(x + w * 0.18)} ${r1(y - h * 0.45)}L${r1(
            x + w * 0.24,
          )} ${r1(y)}" stroke="#2c3236" stroke-width="${r1(w * 0.3)}" stroke-linecap="round"/>`;
      const torsoTop = y - h + head * 2.1;
      const torsoBot = y - h * (seated ? 0.4 : 0.44);
      return `<g>${legs}<path d="M${r1(x - w * 0.5)} ${r1(torsoBot)}Q${r1(x - w * 0.55)} ${r1(torsoTop)} ${r1(x)} ${r1(torsoTop)}Q${r1(
        x + w * 0.55,
      )} ${r1(torsoTop)} ${r1(x + w * 0.5)} ${r1(torsoBot)}Z" fill="${colour}"/><circle cx="${r1(x)}" cy="${r1(y - h + head)}" r="${r1(
        head,
      )}" fill="${skin}"/></g>`;
    },
  };
}

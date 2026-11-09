// Hand-composed 2D drawings: the living-space interior and the eaves/verge detail.
import { PAL } from "./model.mjs";
import { mix, shade } from "./engine.mjs";

const f = (n) => (Math.round(n * 10) / 10).toString();
const poly = (pts, attrs) => `<path d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}Z" ${attrs}/>`;
const line = (a, b, attrs) => `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}" ${attrs}/>`;
const rect = (x, y, w, h, attrs) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" ${attrs}/>`;

let s = 3;
const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

function foliage(cx, cy, r, colour, n = 18) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.8;
    const t = rand();
    const tone = t < 0.3 ? mix(colour, PAL.ink, 0.2) : t > 0.75 ? mix(colour, PAL.paper, 0.18) : colour;
    out += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d * 0.8)}" r="${f(r * (0.22 + rand() * 0.18))}" fill="${tone}" fill-opacity="0.95"/>`;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Interior: from the west wing living space, looking east into the courtyard.
// One-point perspective; the courtyard wall is the back plane (1 m = 210 px).
// ---------------------------------------------------------------------------
export function interiorSvg() {
  s = 3;
  const W = 1800;
  const H = 1200;
  const VP = [900, 615];
  const back = { x0: 220, x1: 1580, top: 300, floor: 930 };
  const toward = (p, y) => {
    // extend the ray from VP through p to height y
    const t = (y - VP[1]) / (p[1] - VP[1]);
    return [VP[0] + (p[0] - VP[0]) * t, y];
  };
  const ink = `stroke="${PAL.ink}" stroke-width="1.6" stroke-linejoin="round"`;
  const thin = `stroke="${PAL.ink}" stroke-opacity="0.35" stroke-width="1"`;
  let o = "";

  // opening in the back wall (oak framed)
  const op = { x0: 470, x1: 1330, top: 447, bot: 930 };

  // --- the view through the glass, drawn first and clipped to the opening
  let view = "";
  view += rect(op.x0, op.top - 10, op.x1 - op.x0, 300, `fill="url(#skyI)"`);
  // east wing beyond: brick wall with zinc eave and its own glazed doors
  const ewTop = 520;
  const ewBot = 760;
  view += poly(
    [
      [op.x0, ewTop - 18],
      [op.x1, ewTop - 18],
      [op.x1, ewTop - 4],
      [op.x0, ewTop - 4],
    ],
    `fill="${PAL.zinc}"`,
  );
  view += rect(op.x0, ewTop - 4, op.x1 - op.x0, 10, `fill="${PAL.oak}"`);
  view += rect(op.x0, ewTop + 6, op.x1 - op.x0, ewBot - ewTop - 6, `fill="${PAL.brick}"`);
  for (let y = ewTop + 12; y < ewBot; y += 9) view += line([op.x0, y], [op.x1, y], `stroke="${PAL.brickLine}" stroke-opacity="0.35" stroke-width="0.8"`);
  for (let y = ewTop + 12, k = 0; y < ewBot - 9; y += 9, k++)
    for (let x = op.x0 + (k % 2) * 13; x < op.x1; x += 26) view += line([x, y], [x, y + 9], `stroke="${PAL.brickLine}" stroke-opacity="0.22" stroke-width="0.8"`);
  // glazed door in the east wing with oak frame
  view += rect(900, 590, 260, 170, `fill="#7f9399" stroke="${PAL.oak}" stroke-width="7"`);
  view += line([1030, 590], [1030, 760], `stroke="${PAL.oak}" stroke-width="6"`);
  view += rect(910, 600, 110, 150, `fill="#c9d6d6" fill-opacity="0.35"`);
  // courtyard paving and planting bed
  view += poly(
    [
      [op.x0, ewBot],
      [op.x1, ewBot],
      [op.x1, op.bot],
      [op.x0, op.bot],
    ],
    `fill="${PAL.stone}"`,
  );
  for (let y = ewBot + 18, g = 18; y < op.bot; g *= 1.35, y += g) view += line([op.x0, y], [op.x1, y], `stroke="#8e8471" stroke-opacity="0.45" stroke-width="1"`);
  for (let k = -8; k <= 8; k++) {
    const x = 900 + k * 70;
    view += line([x, ewBot], toward([x, ewBot], op.bot), `stroke="#8e8471" stroke-opacity="0.35" stroke-width="1"`);
  }
  view += rect(op.x0, 840, op.x1 - op.x0, 26, `fill="${PAL.oak}"`);
  view += foliage(560, 820, 70, "#6b7d50", 22) + foliage(720, 830, 60, "#76875a", 18) + foliage(1180, 825, 75, "#6b7d50", 22);
  // multi-stem tree
  for (const [x0, x1] of [[820, 760], [850, 860], [880, 950]]) view += `<path d="M${x0} 845Q${(x0 + x1) / 2} 700 ${x1} 520" stroke="#5b4f43" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  view += foliage(860, 480, 190, "#76875a", 40);
  // a person sitting on the courtyard bench
  view += rect(1010, 802, 120, 16, `fill="${PAL.oak}"`);
  view += `<path d="M1050 802L1050 760Q1050 742 1066 742L1074 742Q1090 742 1090 760L1090 802Z" fill="#9a5b3f"/><circle cx="1070" cy="731" r="12" fill="#c99a7a"/><path d="M1060 802L1100 802L1100 836" stroke="#2c3236" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  // reflection wash
  view += poly(
    [
      [op.x0, op.top],
      [op.x0 + 260, op.top],
      [op.x0 + 60, op.bot],
      [op.x0, op.bot],
    ],
    `fill="#ffffff" fill-opacity="0.08"`,
  );
  view += poly(
    [
      [op.x0 + 480, op.top],
      [op.x0 + 560, op.top],
      [op.x0 + 360, op.bot],
      [op.x0 + 280, op.bot],
    ],
    `fill="#ffffff" fill-opacity="0.06"`,
  );

  // --- room surfaces
  // ceiling: sloping plaster soffit rising toward the viewer, with exposed timber rafters
  o += poly(
    [
      [0, 0],
      [W, 0],
      [W, 40],
      [back.x1, back.top],
      [back.x0, back.top],
      [0, 40],
    ],
    `fill="${PAL.plaster}" ${ink}`,
  );
  for (let k = 0; k <= 9; k++) {
    const x = back.x0 + ((back.x1 - back.x0) * k) / 9;
    const end = toward([x, back.top], -400);
    o += poly(
      [
        [x - 5, back.top],
        [x + 5, back.top],
        [end[0] + 22, end[1]],
        [end[0] - 22, end[1]],
      ],
      `fill="${PAL.softwood}" stroke="${PAL.ink}" stroke-opacity="0.4" stroke-width="1"`,
    );
  }
  // left wall (north): plaster with an oak shelf
  o += poly(
    [
      [0, 40],
      [back.x0, back.top],
      [back.x0, back.floor],
      [0, H],
    ],
    `fill="${shade(PAL.plaster, 0.93)}" ${ink}`,
  );
  // right wall (south): glazed to the garden, with oak mullions
  o += poly(
    [
      [W, 40],
      [back.x1, back.top],
      [back.x1, back.floor],
      [W, H],
    ],
    `fill="url(#gardenI)" ${ink}`,
  );
  for (const t of [0, 0.32, 0.62, 1]) {
    const xTop = back.x1 + (W - back.x1) * t;
    const yTop = back.top + (40 - back.top) * t + 40 * t;
    const yBot = back.floor + (H - back.floor) * t;
    o += line([xTop, yTop + 30 * (1 - t)], [xTop, yBot], `stroke="${PAL.oak}" stroke-width="${f(8 + t * 18)}"`);
  }
  o += poly(
    [
      [back.x1, back.top + 30],
      [W, 80],
      [W, 110],
      [back.x1, back.top + 42],
    ],
    `fill="${PAL.oak}"`,
  );

  // back wall (east, to the courtyard) with the glazed opening
  o += poly(
    [
      [back.x0, back.top],
      [back.x1, back.top],
      [back.x1, back.floor],
      [back.x0, back.floor],
    ],
    `fill="${PAL.plaster}" ${ink}`,
  );
  o += `<g clip-path="url(#opening)">${view}</g>`;
  o += rect(op.x0, op.top, op.x1 - op.x0, op.bot - op.top, `fill="none" stroke="${PAL.oak}" stroke-width="16"`);
  o += line([(op.x0 + op.x1) / 2, op.top], [(op.x0 + op.x1) / 2, op.bot], `stroke="${PAL.oak}" stroke-width="12"`);
  o += rect(op.x0 - 8, op.top - 8, op.x1 - op.x0 + 16, op.bot - op.top + 8, `fill="none" ${ink}`);

  // floor: oak boards converging on the vanishing point
  o += poly(
    [
      [back.x0, back.floor],
      [back.x1, back.floor],
      [W, H],
      [0, H],
    ],
    `fill="${PAL.oakFloor}" ${ink}`,
  );
  for (let x = back.x0; x <= back.x1; x += 38) o += line([x, back.floor], toward([x, back.floor], H), `stroke="#8a6a45" stroke-opacity="0.35" stroke-width="1"`);
  // daylight falling through the courtyard glazing
  o += poly(
    [
      [op.x0, back.floor],
      [op.x1, back.floor],
      [op.x1 - 120, 1120],
      [op.x0 - 260, 1120],
    ],
    `fill="#fff6e0" fill-opacity="0.28"`,
  );

  // rug, low oak table and sofa (seen from behind) with a person reading
  o += poly(
    [
      [420, 960],
      [1220, 960],
      [1330, 1110],
      [300, 1110],
    ],
    `fill="#d8d1c2" ${thin}`,
  );
  o += poly(
    [
      [700, 955],
      [1010, 955],
      [1030, 975],
      [680, 975],
    ],
    `fill="${PAL.oak}" ${ink}`,
  );
  o += rect(690, 975, 330, 14, `fill="${shade(PAL.oak, 0.85)}" ${ink}`);
  o += `<path d="M660 1010Q900 990 1150 1010L1180 1160L630 1160Z" fill="#8d9a84" ${ink}/>`;
  o += `<path d="M640 1060Q905 1040 1170 1060" stroke="${PAL.ink}" stroke-opacity="0.3" stroke-width="2" fill="none"/>`;
  o += `<path d="M850 1010L850 950Q850 925 880 925L915 925Q945 925 945 950L945 1010Z" fill="#3d4a52"/><circle cx="897" cy="905" r="25" fill="#5a4234"/>`;

  // oak shelf on the left wall
  o += poly(
    [
      [40, 760],
      [180, 820],
      [180, 860],
      [40, 830],
    ],
    `fill="${PAL.oak}" ${ink}`,
  );
  o += poly(
    [
      [40, 830],
      [180, 860],
      [180, 940],
      [40, 935],
    ],
    `fill="${shade(PAL.oak, 0.82)}" ${ink}`,
  );
  // pendant light
  o += line([900, 0], [900, 330], `stroke="${PAL.ink}" stroke-width="2"`);
  o += `<path d="M860 360L940 360L920 330L880 330Z" fill="${PAL.ink}"/><ellipse cx="900" cy="362" rx="40" ry="6" fill="#fff1c9"/>`;

  const defs = `<linearGradient id="skyI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7c8cf"/><stop offset="1" stop-color="#ece7da"/></linearGradient>
<linearGradient id="gardenI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3cfd1"/><stop offset="0.55" stop-color="#d9dccf"/><stop offset="0.56" stop-color="#9aa77f"/><stop offset="1" stop-color="#7f8d62"/></linearGradient>
<clipPath id="opening"><rect x="${op.x0}" y="${op.top}" width="${op.x1 - op.x0}" height="${op.bot - op.top}"/></clipPath>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="${PAL.paper}"/>${o}</svg>`;
}

// ---------------------------------------------------------------------------
// Detail: section through the garden overhang, where the zinc roof, the oak
// soffit and the buff brick gable meet over the glazed opening. 1 m = 520 px.
// ---------------------------------------------------------------------------
export function detailSvg() {
  const W = 1600;
  const H = 1150;
  const Z1 = 1.0; // outer face of brick, measured from the left edge of the drawing
  const X = (z) => 70 + z * 520;
  const Y = (y) => 1060 - (y - 2.2) * 520;
  const R = (z0, y0, z1, y1, attrs) => rect(X(z0), Y(y1), X(z1) - X(z0), Y(y0) - Y(y1), attrs);
  const ink = (w = 2) => `stroke="${PAL.ink}" stroke-width="${w}" stroke-linejoin="round"`;
  let o = "";

  // levels (m)
  const U = 3.3; // rafter underside
  const RT = 3.5; // rafter top
  const DECK = 3.525;
  const ZN = 3.537;
  const BEAM = 2.6;
  const END = Z1 + 1.6;

  // --- inside: plaster ceiling and wall
  o += R(0, U - 0.03, Z1 - 0.32, U, `fill="${PAL.plaster}" ${ink(1.4)}`);
  // --- rafters cut in section, insulation between inside the wall line
  o += R(0, U, Z1 - 0.2, RT, `fill="url(#insul)" ${ink(1.4)}`);
  for (let z = 0.15; z < END; z += 0.45) o += R(z, U, z + 0.05, RT, `fill="url(#timberX)" ${ink(1.4)}`);
  // ply deck and zinc
  o += R(0, RT, END, DECK, `fill="${PAL.softwood}" ${ink(1.4)}`);
  o += R(0, DECK, END + 0.03, ZN, `fill="${PAL.zinc}" ${ink(1)}`);
  for (let z = 0.25; z < END; z += 0.5) o += R(z, ZN, z + 0.012, ZN + 0.03, `fill="${PAL.zinc}" ${ink(1)}`);
  // folded zinc fascia with drip
  o += `<path d="M${X(END)} ${Y(DECK)}L${X(END + 0.03)} ${Y(DECK)}L${X(END + 0.03)} ${Y(U - 0.1)}L${X(END + 0.06)} ${Y(U - 0.14)}" stroke="${PAL.zinc}" stroke-width="6" fill="none" stroke-linejoin="round"/>`;
  o += R(END - 0.035, U - 0.05, END, RT, `fill="url(#timber)" ${ink(1.4)}`);

  // --- oak soffit under the overhang, on battens
  for (let z = Z1 + 0.05; z < END - 0.05; z += 0.4) o += R(z, U - 0.03, z + 0.04, U, `fill="${PAL.softwood}" ${ink(1)}`);
  o += R(Z1 - 0.1, U - 0.052, END - 0.035, U - 0.03, `fill="${PAL.oak}" ${ink(1.4)}`);
  for (let z = Z1 + 0.02; z < END - 0.05; z += 0.14) o += line([X(z), Y(U - 0.052)], [X(z), Y(U - 0.03)], `stroke="#6f5233" stroke-width="1" stroke-opacity="0.6"`);

  // --- gable wall: brick outer leaf, cavity insulation, blockwork inner leaf
  o += R(Z1 - 0.1, BEAM, Z1, RT, `fill="url(#brick)" ${ink(2)}`);
  o += R(Z1 - 0.2, BEAM + 0.05, Z1 - 0.1, U, `fill="url(#board)" ${ink(1.4)}`);
  o += R(Z1 - 0.32, BEAM, Z1 - 0.2, U, `fill="url(#block)" ${ink(2)}`);
  o += R(Z1 - 0.335, BEAM, Z1 - 0.32, U - 0.03, `fill="${PAL.plaster}" ${ink(1)}`);

  // --- steel beam (painted) carrying the inner leaf, angle carrying the brick
  const bz0 = Z1 - 0.34;
  const bz1 = Z1 - 0.18;
  o += `<path d="M${X(bz0)} ${Y(BEAM)}H${X(bz1)}V${Y(BEAM - 0.018)}H${X((bz0 + bz1) / 2 + 0.006)}V${Y(BEAM - 0.282)}H${X(bz1)}V${Y(BEAM - 0.3)}H${X(bz0)}V${Y(BEAM - 0.282)}H${X(
    (bz0 + bz1) / 2 - 0.006,
  )}V${Y(BEAM - 0.018)}H${X(bz0)}Z" fill="${PAL.orange}" ${ink(1.6)}/>`;
  o += `<path d="M${X(Z1 - 0.18)} ${Y(BEAM - 0.1)}V${Y(BEAM)}H${X(Z1)}" stroke="${PAL.ink}" stroke-width="5" fill="none"/>`;
  o += `<path d="M${X(Z1 - 0.18)} ${Y(BEAM - 0.1)}H${X(Z1 - 0.16)}" stroke="${PAL.ink}" stroke-width="3"/>`;

  // --- oak glazing head and triple glazing below
  o += R(Z1 - 0.22, 2.3, Z1 - 0.08, BEAM - 0.1, `fill="url(#timber)" ${ink(1.6)}`);
  o += R(Z1 - 0.18, 2.2, Z1 - 0.12, 2.3, `fill="${PAL.glass}" ${ink(1.2)}`);
  for (const dz of [-0.165, -0.15, -0.135]) o += line([X(Z1 + dz), Y(2.2)], [X(Z1 + dz), Y(2.3)], `stroke="${PAL.ink}" stroke-width="1"`);

  // break lines
  const brk = (x0, y0, x1, y1) => {
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    return `<path d="M${x0} ${y0}L${mx - 8} ${my - 14}L${mx + 8} ${my + 14}L${x1} ${y1}" stroke="${PAL.ink}" stroke-width="1.4" fill="none"/>`;
  };
  o += brk(X(0) - 20, Y(ZN + 0.06), X(0) - 20, Y(U - 0.06));
  o += brk(X(Z1 - 0.36), Y(2.2) + 14, X(Z1 + 0.02), Y(2.2) + 14);

  // overhang dimension
  const dy = Y(ZN) - 120;
  o += `<g stroke="${PAL.ink}" stroke-width="1.2"><path d="M${X(Z1)} ${dy}H${X(END)}"/><path d="M${X(Z1)} ${dy - 14}V${dy + 40}M${X(END)} ${dy - 14}V${dy + 40}" stroke-dasharray="3 4"/><path d="M${X(Z1) - 8} ${dy + 8}L${X(Z1) + 8} ${dy - 8}M${X(END) - 8} ${dy + 8}L${X(END) + 8} ${dy - 8}" stroke-width="2.4"/></g>`;

  // scale bar 0–500 mm
  const sb = [X(0.05), 1110];
  for (let i = 0; i < 5; i++) o += rect(sb[0] + i * 52, sb[1], 52, 8, `fill="${i % 2 ? PAL.paper : PAL.ink}" stroke="${PAL.ink}" stroke-width="1"`);

  // callouts: leader lines from the element to a label point (labels are HTML overlays)
  const callouts = [
    { id: "zinc", label: "Standing-seam zinc on plywood deck", at: [Z1 + 0.85, ZN + 0.01], to: [1080, 120] },
    { id: "rafters", label: "Rafters with insulation between", at: [Z1 - 0.45, 3.4], to: [300, 120] },
    { id: "fascia", label: "Folded zinc fascia and drip", at: [END + 0.04, U - 0.06], to: [1400, 560] },
    { id: "soffit", label: "Oak soffit boards on battens", at: [Z1 + 1.05, U - 0.045], to: [1180, 760] },
    { id: "brick", label: "Pale buff brick outer leaf", at: [Z1 - 0.05, 2.9], to: [820, 900] },
    { id: "cavity", label: "Insulated cavity", at: [Z1 - 0.15, 3.05], to: [300, 560] },
    { id: "block", label: "Blockwork inner leaf, plastered", at: [Z1 - 0.26, 2.75], to: [240, 700] },
    { id: "steel", label: "Painted steel goalpost beam", at: [Z1 - 0.3, 2.42], to: [240, 860] },
    { id: "oak", label: "Oak glazing frame", at: [Z1 - 0.15, 2.36], to: [820, 1030] },
  ];
  const annotations = [];
  callouts.forEach((c, i) => {
    const a = [X(c.at[0]), Y(c.at[1])];
    o += `<path d="M${f(a[0])} ${f(a[1])}L${c.to[0]} ${c.to[1]}" stroke="${PAL.orange}" stroke-width="1.6"/><circle cx="${f(a[0])}" cy="${f(a[1])}" r="5" fill="${PAL.orange}"/>`;
    annotations.push({ id: c.id, n: i + 1, label: c.label, x: +((c.to[0] / W) * 100).toFixed(2), y: +((c.to[1] / H) * 100).toFixed(2) });
  });

  const defs = `<pattern id="brick" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="${PAL.brick}"/><path d="M0 0V14" stroke="${PAL.brickLine}" stroke-width="1.3"/></pattern>
<pattern id="block" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${PAL.block}"/><circle cx="3" cy="3" r="1.2" fill="#7d7b74"/><circle cx="9" cy="8" r="0.9" fill="#7d7b74"/></pattern>
<pattern id="insul" width="26" height="104" patternUnits="userSpaceOnUse"><rect width="26" height="104" fill="#f2ead2"/><path d="M0 0Q13 26 0 52Q13 78 0 104M26 0Q13 26 26 52Q13 78 26 104" stroke="#b9a777" stroke-width="1.2" fill="none"/></pattern>
<pattern id="board" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#efe3bf"/><path d="M0 10L10 0M0 0L10 10" stroke="#b9a777" stroke-width="0.8"/></pattern>
<pattern id="timber" width="10" height="40" patternUnits="userSpaceOnUse"><rect width="10" height="40" fill="${PAL.oak}"/><path d="M3 0Q6 20 3 40" stroke="#6f5233" stroke-width="1" fill="none"/></pattern>
<pattern id="timberX" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${PAL.softwood}"/><path d="M0 0L20 20M20 0L0 20" stroke="#8f7b5a" stroke-width="1"/></pattern>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="${PAL.paper}"/>${o}</svg>`;
  return { svg, annotations };
}

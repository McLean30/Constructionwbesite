/**
 * Builds Three.js objects for Courtyard House from public/model/courtyard-house.json,
 * which scripts/art/export-model.mjs exports from the same model as the 2D plates.
 * Everything created here is tracked so it can be disposed when the scene unmounts.
 */
import * as THREE from "three";

export type LayerData = {
  stage: string;
  material: string;
  solid: { p: number[]; c: number[] };
  glass: { p: number[] };
  decal: { p: number[]; c: number[] };
  lines: { c: string; dashed: boolean; p: number[] }[];
  sprites: {
    kind: "tree" | "person";
    at: [number, number, number];
    height?: number;
    spread?: number;
    stems?: number;
    colour?: string;
    trunk?: string;
    seated?: boolean;
    child?: boolean;
  }[];
};

export type ModelData = {
  camera: { dir: [number, number, number]; plate: { width: number; height: number; margin: number }; bounds: [number, number, number][] };
  palette: string[];
  stages: { id: string; layers: string[]; markers: string[] }[];
  layers: Record<string, LayerData>;
  anchors: { id: string; stage: string; label: string; point: [number, number, number] }[];
};

/** How a layer arrives on site. */
export type Arrival = "base" | "rise" | "drop" | "fade";

export const ARRIVAL: Record<string, Arrival> = {
  "site-base": "base",
  "setting-out-grid": "fade",
  "ground-slab": "rise",
  "courtyard-void": "fade",
  "blockwork-inner-leaf": "rise",
  "steel-goalpost-frames": "drop",
  "roof-timbers": "drop",
  "brick-outer-leaf": "rise",
  glazing: "fade",
  "zinc-roof": "drop",
  "oak-joinery": "fade",
  "timber-soffits": "drop",
  "interior-finishes": "fade",
  "courtyard-planting": "rise",
};

/** Surface finish per material key from content/stages.ts, tuned against the concept visualisation (wet dusk light). */
const FINISH: Record<string, { roughness: number; metalness: number }> = {
  concrete: { roughness: 0.92, metalness: 0 },
  blockwork: { roughness: 0.95, metalness: 0 },
  steel: { roughness: 0.55, metalness: 0.45 },
  softwood: { roughness: 0.8, metalness: 0 },
  "buff-brick": { roughness: 0.88, metalness: 0 },
  glass: { roughness: 0.05, metalness: 0.2 },
  zinc: { roughness: 0.38, metalness: 0.55 },
  oak: { roughness: 0.62, metalness: 0 },
  plaster: { roughness: 0.9, metalness: 0 },
  stone: { roughness: 0.55, metalness: 0.05 },
  planting: { roughness: 0.9, metalness: 0 },
};

export interface LayerHandle {
  id: string;
  stage: string;
  arrival: Arrival;
  group: THREE.Group;
  /** Materials whose emissive is used for the gold highlight. */
  lit: THREE.MeshStandardMaterial[];
  /** Every material that fades with the layer, with its resting opacity. */
  fading: { m: THREE.Material & { opacity: number }; rest: number }[];
  progress: number;
  highlight: number;
}

export interface House {
  root: THREE.Group;
  layers: Map<string, LayerHandle>;
  markers: Map<string, THREE.Sprite[]>;
  interiorLights: THREE.PointLight[];
  dispose(): void;
}

/** Brushed gold: picks out the parts added at the current stage. */
export const HIGHLIGHT_GOLD = new THREE.Color("#c6a365");

/** Small deterministic random generator so trees look the same on every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildHouse(data: ModelData, { anisotropy = 1 }: { anisotropy?: number } = {}): House {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
    if (x instanceof THREE.BufferGeometry) geometries.push(x);
    else materials.push(x as THREE.Material);
    return x;
  };

  const palette = data.palette.map((hex) => new THREE.Color(hex)); // sRGB hex -> linear working space
  const root = new THREE.Group();
  root.name = "courtyard-house";
  const layers = new Map<string, LayerHandle>();

  const triangles = (p: number[], c?: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    if (c) {
      const colours = new Float32Array((p.length / 9) * 9);
      c.forEach((ci, t) => {
        const col = palette[ci];
        for (let v = 0; v < 3; v++) colours.set([col.r, col.g, col.b], t * 9 + v * 3);
      });
      g.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    }
    g.computeVertexNormals(); // non-indexed: flat, faceted normals like the drawings
    return track(g);
  };

  for (const [id, L] of Object.entries(data.layers)) {
    const group = new THREE.Group();
    group.name = id;
    const handle: LayerHandle = { id, stage: L.stage, arrival: ARRIVAL[id] ?? "fade", group, lit: [], fading: [], progress: 1, highlight: 0 };
    const finish = FINISH[L.material] ?? { roughness: 0.8, metalness: 0 };

    if (L.solid.p.length) {
      const m = track(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, ...finish }));
      const mesh = new THREE.Mesh(triangles(L.solid.p, L.solid.c), m);
      mesh.castShadow = id !== "site-base" && id !== "courtyard-void";
      mesh.receiveShadow = true;
      group.add(mesh);
      handle.lit.push(m);
      handle.fading.push({ m, rest: 1 });
      // fine light edges echo the plate linework
      if (id !== "site-base" && id !== "courtyard-planting") {
        const edges = track(new THREE.EdgesGeometry(mesh.geometry, 28));
        const em = track(new THREE.LineBasicMaterial({ color: "#efe9dc", transparent: true, opacity: 0.16, depthWrite: false }));
        group.add(new THREE.LineSegments(edges, em));
        handle.fading.push({ m: em, rest: 0.16 });
      }
    }
    if (L.decal.p.length) {
      const m = track(
        new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.3, metalness: 0.25, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      );
      group.add(new THREE.Mesh(triangles(L.decal.p, L.decal.c), m));
      handle.lit.push(m);
      handle.fading.push({ m, rest: 1 });
    }
    if (L.glass.p.length) {
      const m = track(
        new THREE.MeshStandardMaterial({ color: "#a9bcc0", transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
      );
      const mesh = new THREE.Mesh(triangles(L.glass.p), m);
      mesh.renderOrder = 2;
      group.add(mesh);
      handle.lit.push(m);
      handle.fading.push({ m, rest: 0.32 });
    }
    for (const line of L.lines) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(line.p, 3));
      track(g);
      const rest = id === "setting-out-grid" || id === "courtyard-void" ? 0.55 : 0.45;
      const m = track(
        line.dashed
          ? new THREE.LineDashedMaterial({ color: line.c, dashSize: 0.45, gapSize: 0.35, transparent: true, opacity: rest, depthWrite: false })
          : new THREE.LineBasicMaterial({ color: line.c, transparent: true, opacity: rest, depthWrite: false }),
      );
      const seg = new THREE.LineSegments(g, m);
      if (line.dashed) seg.computeLineDistances();
      group.add(seg);
      handle.fading.push({ m, rest });
    }

    // trees and people, rebuilt in 3D from the sprite parameters used by the drawings
    const rand = seeded(42);
    for (const sp of L.sprites) {
      const at = new THREE.Vector3(...sp.at);
      if (sp.kind === "tree") {
        const h = sp.height ?? 6;
        const spread = sp.spread ?? 2;
        const stems = sp.stems ?? 1;
        const bark = track(new THREE.MeshStandardMaterial({ color: sp.trunk ?? "#5b4f43", roughness: 0.9 }));
        const leaf = track(new THREE.MeshStandardMaterial({ color: sp.colour ?? "#6f7f55", roughness: 0.85, flatShading: true }));
        handle.lit.push(leaf);
        handle.fading.push({ m: bark, rest: 1 }, { m: leaf, rest: 1 });
        for (let s = 0; s < stems; s++) {
          const lean = (s - (stems - 1) / 2) * 0.18;
          const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.09, h * 0.62, 6)), bark);
          stem.position.copy(at).add(new THREE.Vector3(lean * h * 0.3, h * 0.31, 0));
          stem.rotation.z = -lean;
          stem.castShadow = true;
          group.add(stem);
        }
        const clump = track(new THREE.IcosahedronGeometry(1, 1));
        const n = Math.round(7 + spread * 3);
        for (let i = 0; i < n; i++) {
          const a = rand() * Math.PI * 2;
          const r = Math.sqrt(rand()) * spread * 0.55;
          const blob = new THREE.Mesh(clump, leaf);
          const size = spread * (0.28 + rand() * 0.18);
          blob.scale.set(size, size * 0.85, size);
          blob.position.set(at.x + Math.cos(a) * r, at.y + h * (0.62 + rand() * 0.22), at.z + Math.sin(a) * r);
          blob.castShadow = true;
          group.add(blob);
        }
      } else {
        const scale = (sp.child ? 1.15 : 1.72) * (sp.seated ? 0.72 : 1);
        const cloth = track(new THREE.MeshStandardMaterial({ color: sp.colour ?? "#3d4a52", roughness: 0.85 }));
        const skin = track(new THREE.MeshStandardMaterial({ color: "#c99a7a", roughness: 0.7 }));
        handle.fading.push({ m: cloth, rest: 1 }, { m: skin, rest: 1 });
        const body = new THREE.Mesh(track(new THREE.CapsuleGeometry(scale * 0.11, scale * 0.52, 4, 8)), cloth);
        body.position.copy(at).add(new THREE.Vector3(0, scale * 0.42, 0));
        body.castShadow = true;
        const head = new THREE.Mesh(track(new THREE.SphereGeometry(scale * 0.075, 12, 8)), skin);
        head.position.copy(at).add(new THREE.Vector3(0, scale * 0.86, 0));
        group.add(body, head);
      }
    }
    root.add(group);
    layers.set(id, handle);
  }

  // warm interior glow, as in the visualisation; switched on with the interior finishes
  const interiorLights = [
    [3.2, 1.9, 12.5],
    [16.8, 1.9, 9.5],
    [10, 2.1, 2.4],
  ].map(([x, y, z]) => {
    const l = new THREE.PointLight("#ffb46e", 0, 5.5, 2);
    l.position.set(x, y, z);
    root.add(l);
    return l;
  });

  // numbered markers matching the "Added at this stage" list
  const markers = new Map<string, THREE.Sprite[]>();
  const markerTexture = (n: number) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fillStyle = "#c6a365";
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#f1eee5";
    ctx.stroke();
    ctx.fillStyle = "#121311";
    ctx.font = "700 64px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), 64, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = anisotropy;
    textures.push(t);
    return t;
  };
  for (const st of data.stages) {
    const list: THREE.Sprite[] = [];
    st.markers.forEach((id, i) => {
      const a = data.anchors.find((x) => x.id === id && x.stage === st.id);
      if (!a) return;
      const m = track(new THREE.SpriteMaterial({ map: markerTexture(i + 1), depthTest: false, depthWrite: false, transparent: true, opacity: 0 }));
      const s = new THREE.Sprite(m);
      s.position.set(...a.point);
      s.renderOrder = 10;
      s.visible = false;
      root.add(s);
      list.push(s);
    });
    markers.set(st.id, list);
  }

  return {
    root,
    layers,
    markers,
    interiorLights,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      root.clear();
    },
  };
}

/** Apply a layer's arrival progress (0 = not built, 1 = in place) and highlight (0..1). */
export function applyLayer(h: LayerHandle) {
  const p = h.progress;
  const g = h.group;
  if (h.arrival === "base") {
    g.visible = true;
  } else {
    g.visible = p > 0.001;
    g.scale.y = h.arrival === "rise" ? Math.max(0.001, p) : 1;
    g.position.y = h.arrival === "drop" ? (1 - p) * 3.2 : 0;
    const fadeIn = h.arrival === "rise" ? Math.min(1, p * 3) : p;
    for (const { m, rest } of h.fading) {
      const target = rest * fadeIn;
      const transparent = target < rest - 1e-3 || rest < 1;
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
      m.opacity = target;
      m.depthWrite = !transparent || rest === 1;
    }
  }
  if (h.arrival !== "base") {
    for (const m of h.lit) {
      m.emissive.copy(HIGHLIGHT_GOLD);
      m.emissiveIntensity = h.highlight * 0.95;
    }
  }
}

/**
 * Orthographic framing that reproduces the 2D plate (scripts/art/build-art.mjs, fitOrtho with
 * the same bounds and margin), so the first 3D frame sits exactly over the illustration.
 */
export function plateFraming(data: ModelData) {
  const dir = new THREE.Vector3(...data.camera.dir).normalize();
  const f = dir.clone().negate();
  const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const u = new THREE.Vector3().crossVectors(r, f);
  const pts = data.camera.bounds.map((p) => new THREE.Vector3(...p));
  const xs = pts.map((p) => p.dot(r));
  const ys = pts.map((p) => p.dot(u));
  const zs = pts.map((p) => p.dot(f));
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  const { width: W, height: H, margin } = data.camera.plate;
  const scale = Math.min((W - 2 * margin) / w, (H - 2 * margin) / h); // px per metre on the plate
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const cz = (Math.max(...zs) + Math.min(...zs)) / 2;
  const target = r.clone().multiplyScalar(cx).add(u.clone().multiplyScalar(cy)).add(f.clone().multiplyScalar(cz));
  return { dir, target, halfHeight: H / scale / 2, plateAspect: W / H, pxPerMetre: scale };
}

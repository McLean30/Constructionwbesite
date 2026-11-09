"use client";

/**
 * Interactive 3D assembly of Courtyard House (milestone two).
 * Loaded lazily by StageExplorer: nothing here is needed for the hero or the enquiry form.
 *
 * - Geometry, layers and anchors come from public/model/courtyard-house.json, exported from
 *   the same model as the 2D plates, and the camera opens on the plate's axonometric framing.
 * - Rendering is on demand: frames are drawn only while GSAP animates, the view is moving or
 *   the canvas resizes.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { applyLayer, buildHouse, plateFraming, type House, type ModelData } from "./houseModel";

export interface AssemblyProps {
  /** Index of the stage being shown, 0 = Foundations. */
  stageIndex: number;
  /** Incremented by Replay: the house is cleared and built again from the slab. */
  buildKey: number;
  /** Playback paused: freeze any transition in progress. */
  paused: boolean;
  reducedMotion: boolean;
  /** Incremented by Reset view. */
  resetViewKey: number;
  onReady: () => void;
  onError: (error: unknown) => void;
}

const BACKGROUND = "#262a27";
const IN_DURATION = 1.15;
const OUT_DURATION = 0.45;
const HIGHLIGHT_HOLD = 1.5;

class SceneBoundary extends Component<{ onError: (e: unknown) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Assembly3D(props: AssemblyProps) {
  const [data, setData] = useState<ModelData | null>(null);
  const { onError } = props;

  useEffect(() => {
    const ac = new AbortController();
    fetch("/model/courtyard-house.json", { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Model request failed (${r.status})`);
        return r.json() as Promise<ModelData>;
      })
      .then(setData)
      .catch((e) => {
        if (e?.name !== "AbortError") onError(e);
      });
    return () => ac.abort();
  }, [onError]);

  // phones and touch devices: lower resolution cap, no shadow maps
  const constrained = useMemo(() => typeof window !== "undefined" && window.matchMedia("(max-width: 759px), (pointer: coarse)").matches, []);

  if (!data) return null;
  return (
    <SceneBoundary onError={onError}>
      <Canvas
        orthographic
        frameloop="demand"
        dpr={constrained ? [1, 1.5] : [1, 2]}
        shadows={constrained ? false : { type: THREE.PCFShadowMap }}
        camera={{ manual: true, near: 0.1, far: 400 }}
        gl={{ antialias: true, powerPreference: constrained ? "low-power" : "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          // neutral tone mapping keeps the brick, zinc and oak close to their reference colours
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              onError(new Error("WebGL context lost"));
            },
            { once: true },
          );
        }}
      >
        <Scene data={data} constrained={constrained} {...props} />
      </Canvas>
    </SceneBoundary>
  );
}

function Scene({ data, constrained, stageIndex, buildKey, paused, reducedMotion, resetViewKey, onReady }: AssemblyProps & { data: ModelData; constrained: boolean }) {
  const { gl, camera, size, invalidate, scene } = useThree();
  const cam = camera as THREE.OrthographicCamera;
  const framing = useMemo(() => plateFraming(data), [data]);
  const house = useMemo<House>(() => buildHouse(data, { anisotropy: gl.capabilities.getMaxAnisotropy() }), [data, gl]);
  const stageIds = useMemo(() => data.stages.map((s) => s.id), [data]);
  const home = useMemo(() => ({ position: framing.target.clone().add(framing.dir.clone().multiplyScalar(80)), target: framing.target.clone() }), [framing]);

  // ---- scene, camera and light set-up -------------------------------------------------
  useLayoutEffect(() => {
    scene.background = new THREE.Color(BACKGROUND);
    cam.position.copy(home.position);
    cam.up.set(0, 1, 0);
    cam.lookAt(home.target);
  }, [scene, cam, home]);

  useLayoutEffect(() => {
    const hh = framing.halfHeight;
    const aspect = size.width / Math.max(1, size.height);
    cam.top = hh;
    cam.bottom = -hh;
    cam.left = -hh * aspect;
    cam.right = hh * aspect;
    cam.near = 0.1;
    cam.far = 400;
    cam.updateProjectionMatrix();
    // markers keep a constant on-screen size: about 30 CSS px, smaller on narrow phone canvases
    const worldPerPx = (2 * hh) / Math.max(1, size.height);
    const markerPx = size.width < 560 ? 22 : 30;
    for (const list of house.markers.values()) for (const s of list) s.scale.setScalar(markerPx * worldPerPx);
    invalidate();
  }, [cam, size, framing, house, invalidate]);

  const sun = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const light = sun.current;
    if (!light) return;
    light.target.position.copy(framing.target);
    light.target.updateMatrixWorld();
  }, [framing]);
  const sunPosition = useMemo(() => framing.target.clone().add(new THREE.Vector3(-0.5, 0.78, 0.62).normalize().multiplyScalar(45)), [framing]);

  // ---- orbit: gentle, rotate only, page keeps vertical touch scrolling ----------------
  const controls = useMemo(() => {
    // place the camera first: the orbit limits are measured from this starting view
    cam.position.copy(home.position);
    cam.up.set(0, 1, 0);
    cam.lookAt(home.target);
    const c = new OrbitControls(cam, gl.domElement);
    c.enableZoom = false; // the mouse wheel keeps scrolling the page
    c.enablePan = false;
    c.enableDamping = true;
    c.dampingFactor = 0.12;
    c.rotateSpeed = 0.5;
    c.target.copy(home.target);
    c.update();
    const az = c.getAzimuthalAngle();
    const polar = c.getPolarAngle();
    c.minAzimuthAngle = az - 0.55;
    c.maxAzimuthAngle = az + 0.55;
    c.minPolarAngle = Math.max(0.2, polar - 0.38);
    c.maxPolarAngle = Math.min(1.42, polar + 0.22);
    c.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.ROTATE };
    // OrbitControls sets touch-action: none; let the browser keep vertical swipes for scrolling
    gl.domElement.style.touchAction = "pan-y";
    return c;
  }, [cam, gl, home]);

  useEffect(() => {
    const onChange = () => {
      gl.domElement.dataset.azimuth = controls.getAzimuthalAngle().toFixed(3);
      invalidate();
    };
    controls.addEventListener("change", onChange);
    return () => {
      controls.removeEventListener("change", onChange);
      controls.dispose();
    };
  }, [controls, invalidate, gl]);

  // ---- first successful frame: tell the explorer to swap the illustration for 3D -------
  const readySent = useRef(false);
  useFrame(() => {
    if (controls.enabled && controls.update()) invalidate(); // damping settles over a few frames
    if (!readySent.current) {
      readySent.current = true;
      requestAnimationFrame(() => {
        if (!gl.getContext().isContextLost()) onReady();
      });
    }
  });

  // ---- stage transitions ----------------------------------------------------------------
  const built = useRef(-2); // highest stage index currently in place; -2 = not yet initialised
  const lastBuildKey = useRef(buildKey);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const settle = useRef<gsap.core.Tween | null>(null);

  // state mirrored onto the canvas element for automated checks (and handy when debugging)
  const mark = (stage: number, state: "animating" | "settled") => {
    const el = gl.domElement;
    el.dataset.stage = stageIds[stage] ?? "none";
    el.dataset.state = state;
    el.dataset.built = [...house.layers.values()].filter((h) => h.arrival !== "base" && h.progress >= 0.999).map((h) => h.id).join(",");
  };
  const render = () => {
    for (const h of house.layers.values()) applyLayer(h);
    const interior = house.layers.get("interior-finishes");
    for (const l of house.interiorLights) l.intensity = (interior?.progress ?? 0) * 3.5;
    invalidate();
  };
  const stageOf = (layerId: string) => stageIds.indexOf(house.layers.get(layerId)!.stage);
  const layersFor = (i: number) => data.stages[i].layers.map((id) => house.layers.get(id)!).filter((h) => h.arrival !== "base");
  const showMarkers = (stage: number, animate: boolean) => {
    house.markers.forEach((list, id) => {
      const on = id === stageIds[stage];
      for (const s of list) {
        const mat = s.material as THREE.SpriteMaterial;
        gsap.killTweensOf(mat);
        if (on && animate) {
          s.visible = true;
          gsap.to(mat, { opacity: 1, duration: 0.35, delay: 0.25, onUpdate: invalidate });
        } else {
          s.visible = on;
          mat.opacity = on ? 1 : 0;
        }
      }
    });
  };

  useEffect(() => {
    const target = stageIndex;
    const fromEmpty = buildKey !== lastBuildKey.current;
    lastBuildKey.current = buildKey;
    tl.current?.kill();
    settle.current?.kill();

    // first mount: match the illustration exactly (this stage built, its parts tinted orange)
    if (built.current === -2) {
      for (const h of house.layers.values()) {
        h.progress = h.arrival === "base" || stageOf(h.id) <= target ? 1 : 0;
        h.highlight = stageOf(h.id) === target ? 0.7 : 0;
      }
      built.current = target;
      showMarkers(target, false);
      render();
      mark(target, "settled");
      const fade = { k: 1 };
      settle.current = gsap.to(fade, {
        k: 0,
        duration: reducedMotion ? 0 : 1.2,
        delay: 1.6,
        onUpdate: () => {
          for (const h of layersFor(target)) h.highlight = 0.7 * fade.k;
          render();
        },
      });
      return;
    }

    if (fromEmpty) {
      for (const h of house.layers.values()) {
        h.progress = h.arrival === "base" ? 1 : 0;
        h.highlight = 0;
      }
      built.current = -1;
      showMarkers(-1, false);
      render();
    }

    const from = built.current;
    built.current = target;

    if (reducedMotion) {
      // switch immediately; the orange highlight appears and is removed without movement
      for (const h of house.layers.values()) {
        if (h.arrival === "base") continue;
        h.progress = stageOf(h.id) <= target ? 1 : 0;
        h.highlight = stageOf(h.id) === target ? 1 : 0;
      }
      showMarkers(target, false);
      render();
      mark(target, "settled");
      settle.current = gsap.delayedCall(HIGHLIGHT_HOLD, () => {
        for (const h of layersFor(target)) h.highlight = 0;
        render();
      });
      return;
    }

    const timeline = gsap.timeline({
      paused,
      onUpdate: render,
      onComplete: () => {
        render();
        mark(target, "settled");
      },
    });
    tl.current = timeline;
    mark(target, "animating");
    showMarkers(-1, false);

    // Plan from each layer's actual state, so an interrupted transition (rapid stage changes)
    // always ends exactly at the chosen stage.
    void from;
    const all = [...house.layers.values()].filter((h) => h.arrival !== "base");
    const leaving = all.filter((h) => stageOf(h.id) > target && (h.progress > 0 || h.highlight > 0));
    for (const h of leaving) timeline.to(h, { progress: 0, highlight: 0, duration: OUT_DURATION, ease: "power2.in" }, 0);
    const start = leaving.length ? OUT_DURATION * 0.6 : 0;

    // clear any highlight left on earlier stages
    for (const h of all) if (stageOf(h.id) < target && h.highlight > 0) timeline.to(h, { highlight: 0, duration: 0.4 }, 0);

    // build each missing stage in order; when skipping ahead the stages overlap so it stays brief
    let at = start;
    for (let i = 0; i <= target; i++) {
      const isTarget = i === target;
      const arriving = layersFor(i).filter((h) => h.progress < 1);
      arriving.forEach((h, k) => {
        const t = at + k * 0.22;
        const d = IN_DURATION * Math.max(0.35, 1 - h.progress);
        timeline.to(h, { progress: 1, duration: d, ease: "power3.out" }, t);
        timeline.to(h, { highlight: 1, duration: 0.25, ease: "none" }, t);
        timeline.to(h, { highlight: 0, duration: 0.9, ease: "power1.inOut" }, t + (isTarget ? HIGHLIGHT_HOLD : 0.6));
      });
      if (!isTarget && arriving.length) at += 0.55;
      // the chosen stage is always picked out, even when its parts were already in place
      if (isTarget && arriving.length === 0) {
        for (const h of layersFor(target)) {
          timeline.to(h, { highlight: 1, duration: 0.25 }, start);
          timeline.to(h, { highlight: 0, duration: 0.9 }, start + HIGHLIGHT_HOLD);
        }
      }
    }
    timeline.call(() => showMarkers(target, true), [], start + 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, buildKey]);

  useEffect(() => {
    if (!tl.current) return;
    if (paused) tl.current.pause();
    else if (tl.current.progress() < 1) tl.current.resume();
  }, [paused]);

  // ---- reset view ---------------------------------------------------------------------
  const firstReset = useRef(resetViewKey);
  useEffect(() => {
    if (resetViewKey === firstReset.current) return;
    const from = cam.position.clone();
    controls.enabled = false;
    const finish = () => {
      cam.position.copy(home.position);
      controls.target.copy(home.target);
      cam.lookAt(home.target);
      controls.enabled = true;
      controls.update();
      invalidate();
    };
    if (reducedMotion) return finish();
    const t = { k: 0 };
    const tween = gsap.to(t, {
      k: 1,
      duration: 0.7,
      ease: "power2.inOut",
      onUpdate: () => {
        // ease around the target on the sphere rather than cutting through it
        const dir = from.clone().sub(home.target).normalize().lerp(home.position.clone().sub(home.target).normalize(), t.k).normalize();
        cam.position.copy(home.target).add(dir.multiplyScalar(80));
        cam.lookAt(home.target);
        invalidate();
      },
      onComplete: finish,
    });
    return () => {
      tween.kill();
      controls.enabled = true;
    };
  }, [resetViewKey, cam, controls, home, reducedMotion, invalidate]);

  // ---- release everything on unmount ----------------------------------------------------
  useEffect(
    () => () => {
      tl.current?.kill();
      settle.current?.kill();
      house.markers.forEach((list) => list.forEach((s) => gsap.killTweensOf(s.material)));
      house.dispose();
    },
    [house],
  );

  const shadowSize = constrained ? 512 : 2048;
  return (
    <>
      {/* soft overcast dusk with a low warm sun, after the concept visualisation */}
      <hemisphereLight args={["#dfe5e8", "#6b5a46", 1.9]} />
      <ambientLight intensity={0.35} color="#f3e6d2" />
      <directionalLight
        ref={sun}
        position={sunPosition}
        intensity={2.6}
        color="#ffd9b0"
        castShadow={!constrained}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />
      <primitive object={house.root} />
    </>
  );
}

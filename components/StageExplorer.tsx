"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { stages, type StageId } from "@/content/stages";
import annotations from "@/content/generated/annotations.json";
import type { AssemblyProps } from "./assembly/Assembly3D";

type Anchors = Record<string, { id: string; label: string; x: number; y: number }[]>;
const anchors = annotations as Anchors;

// React Three Fiber, Three.js and GSAP live in this chunk. It is requested only when the
// plate approaches the viewport, never for the hero or the enquiry form.
const Assembly3D = dynamic<AssemblyProps>(() => import("./assembly/Assembly3D"), { ssr: false, loading: () => null });

type Mode = "illustration" | "loading" | "ready" | "unavailable";
type Playback = "idle" | "playing" | "paused" | "done";

/** Time on each stage while playing: long enough to watch the parts arrive and read the caption. */
const STAGE_MS = 4200;
const STAGE_MS_REDUCED = 3200;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    const ok = !!gl && !gl.isContextLost();
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/**
 * "See how the house comes together": the construction plate, four stage tabs (WAI-ARIA tabs,
 * automatic activation) and the "Added at this stage" list. When the plate nears the viewport
 * the 3D assembly loads behind the illustration and takes over after its first frame. If WebGL
 * is missing or the scene fails, the illustrated plates stay and everything keeps working.
 */
export function StageExplorer({ headingId }: { headingId: string }) {
  const [active, setActive] = useState<StageId>(stages[0].id);
  const [mode, setMode] = useState<Mode>("illustration");
  const [unavailableReason, setUnavailableReason] = useState("");
  const [playback, setPlayback] = useState<Playback>("idle");
  const [buildKey, setBuildKey] = useState(0);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const frameRef = useRef<HTMLDivElement>(null);
  const index = stages.findIndex((s) => s.id === active);
  const stage = stages[index];

  // ---- reduced motion -----------------------------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ---- lazy-load the 3D assembly as the plate approaches the viewport -----------------
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection?.saveData) {
          setUnavailableReason("Data saver is on, so the illustrated plates are shown instead of the 3D model.");
          setMode("unavailable");
        } else if (!webglAvailable()) {
          setUnavailableReason("This browser can't show the 3D model, so the illustrated plates are shown instead.");
          setMode("unavailable");
        } else setMode("loading");
      },
      { rootMargin: "320px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => setMode((m) => (m === "loading" ? "ready" : m)), []);
  const onError = useCallback((error: unknown) => {
    console.warn("3D assembly unavailable, keeping the illustrated plates.", error);
    setUnavailableReason("The 3D model couldn't load, so the illustrated plates are shown instead.");
    setMode("unavailable");
  }, []);

  // ---- playback -------------------------------------------------------------------------
  const timer = useRef<{ id?: number; remaining: number; started: number }>({ remaining: 0, started: 0 });
  const indexRef = useRef(index);
  indexRef.current = index;
  const stageMs = reducedMotion ? STAGE_MS_REDUCED : STAGE_MS;

  const clearTimer = () => {
    if (timer.current.id) window.clearTimeout(timer.current.id);
    timer.current.id = undefined;
  };
  const schedule = (ms: number) => {
    clearTimer();
    timer.current.started = performance.now();
    timer.current.remaining = ms;
    timer.current.id = window.setTimeout(advance, ms);
  };
  function advance() {
    const next = indexRef.current + 1;
    if (next >= stages.length) {
      timer.current.id = undefined;
      setPlayback("done");
      return;
    }
    setActive(stages[next].id);
    schedule(stageMs);
  }
  const replay = () => {
    setBuildKey((k) => k + 1);
    setActive(stages[0].id);
    setPlayback("playing");
    schedule(stageMs);
  };
  const play = () => {
    if (playback === "paused") {
      setPlayback("playing");
      schedule(timer.current.remaining);
    } else replay();
  };
  const pause = () => {
    clearTimer();
    timer.current.remaining = Math.max(400, timer.current.remaining - (performance.now() - timer.current.started));
    setPlayback("paused");
  };
  const stopPlayback = () => {
    clearTimer();
    setPlayback((p) => (p === "idle" ? p : "idle"));
  };
  useEffect(() => () => clearTimer(), []);

  // ---- stage selection (stops playback and goes straight to the stage) ------------------
  const select = (i: number, focus = true) => {
    const next = stages[(i + stages.length) % stages.length];
    stopPlayback();
    setActive(next.id);
    if (focus) tabRefs.current[next.id]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowDown: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      ArrowUp: () => select(index - 1),
      Home: () => select(0),
      End: () => select(stages.length - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const is3d = mode === "ready";
  const status =
    playback === "playing"
      ? `Playing the build: stage ${stage.number} of 4, ${stage.title}.`
      : playback === "paused"
        ? `Paused at stage ${stage.number}, ${stage.title}.`
        : playback === "done"
          ? "Build complete."
          : `Showing stage ${stage.number}, ${stage.title}.`;

  return (
    <div className={`explorer ${is3d ? "is-3d" : ""}`} data-stage={active} data-mode={mode} data-playback={playback}>
      <figure className="plate">
        <div className="plate__frame" ref={frameRef}>
          {stages.map((s) => (
            // Plain <img>: lightweight vector plates, already sized for the frame. They stay
            // underneath the 3D canvas so the drawing is never replaced by an empty box.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.id}
              src={s.plate.src}
              width={s.plate.width}
              height={s.plate.height}
              alt={s.id === active ? s.illustration.alt : ""}
              aria-hidden={s.id !== active}
              loading="lazy"
              decoding="async"
              className={`plate__img ${s.id === active ? "is-active" : ""}`}
            />
          ))}
          {!is3d && (
            <div className="plate__marks" aria-hidden="true" key={active}>
              {(anchors[`plate-${active}`] ?? [])
                .filter((a) => stage.markers.includes(a.id))
                .map((a) => {
                  const n = stage.markers.indexOf(a.id) + 1;
                  return (
                    <span key={a.id} className="marker marker--plate" style={{ left: `${a.x}%`, top: `${a.y}%`, animationDelay: `${120 + n * 90}ms` }}>
                      <span className="marker__dot">{n}</span>
                    </span>
                  );
                })}
            </div>
          )}
          {(mode === "loading" || mode === "ready") && (
            <div className="assembly" aria-hidden="true">
              <Assembly3D
                stageIndex={index}
                buildKey={buildKey}
                paused={playback === "paused"}
                reducedMotion={reducedMotion}
                resetViewKey={resetViewKey}
                onReady={onReady}
                onError={onError}
              />
            </div>
          )}
          {mode === "loading" && <p className="plate__chip">Loading 3D model…</p>}
          {is3d && <p className="plate__chip plate__chip--hint">3D model · drag sideways to turn</p>}
        </div>
        <figcaption className="plate__titleblock">
          <span>Courtyard House</span>
          <span>{is3d ? "Interactive model from the south-east" : "Axonometric from the south-east"}</span>
          <span className="plate__stage">
            Stage 0{stage.number} / 04 · {stage.title}
          </span>
          <span className="plate__key">
            <span className="plate__key-swatch" aria-hidden="true" /> Added at this stage
          </span>
        </figcaption>
      </figure>

      <div className="explorer__side">
        <div className="assembly-controls" role="group" aria-label="Build playback">
          <button
            type="button"
            className="button button--primary button--small assembly-controls__play"
            onClick={playback === "playing" ? pause : play}
            aria-label={playback === "playing" ? "Pause the build" : "Play the build"}
          >
            <span aria-hidden="true" className={`assembly-controls__icon is-${playback === "playing" ? "pause" : "play"}`} />
            {playback === "playing" ? "Pause" : "Play the build"}
          </button>
          <button type="button" className="button button--dark button--small" onClick={replay} disabled={playback === "idle" && buildKey === 0}>
            Replay
          </button>
          {is3d && (
            <button type="button" className="button button--dark button--small" onClick={() => setResetViewKey((k) => k + 1)}>
              Reset view
            </button>
          )}
        </div>
        {mode === "unavailable" && <p className="assembly-note">{unavailableReason}</p>}

        <div className="explorer__tabs" role="tablist" aria-labelledby={headingId} aria-orientation="vertical" onKeyDown={onKeyDown}>
          {stages.map((s, i) => {
            const selected = s.id === active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[s.id] = el;
                }}
                type="button"
                role="tab"
                id={`stage-tab-${s.id}`}
                aria-selected={selected}
                aria-controls="stage-panel"
                tabIndex={selected ? 0 : -1}
                className={`explorer__tab ${i < index ? "is-reached" : ""}`}
                onClick={() => select(i, false)}
              >
                <span className="explorer__tab-n">0{s.number}</span>
                <span className="explorer__tab-title">{s.title}</span>
                <span className="explorer__tab-summary">{s.summary}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="explorer__panel" role="tabpanel" id="stage-panel" aria-labelledby={`stage-tab-${active}`} tabIndex={0} key={active}>
        <div className="explorer__description">
          {stage.description.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <div className="explorer__additions">
          <h3 className="explorer__subhead">Added at this stage</h3>
          <ol className="explorer__added">
            {stage.added.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

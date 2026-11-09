"use client";

import { useRef, useState } from "react";
import { stages, type StageId } from "@/content/stages";
import annotations from "@/content/generated/annotations.json";

type Anchors = Record<string, { id: string; label: string; x: number; y: number }[]>;
const anchors = annotations as Anchors;

/**
 * "See how the house comes together": a construction plate with a vertical
 * WAI-ARIA tab list (automatic activation). Every plate is drawn from the same
 * viewpoint, so switching stages shows exactly what was added, in safety orange.
 * On phones the tabs sit directly below the plate.
 */
export function StageExplorer({ headingId }: { headingId: string }) {
  const [active, setActive] = useState<StageId>(stages[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const index = stages.findIndex((s) => s.id === active);
  const stage = stages[index];

  const select = (i: number, focus = true) => {
    const next = stages[(i + stages.length) % stages.length];
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

  return (
    <div className="explorer" data-stage={active}>
      <figure className="plate">
        <div className="plate__frame">
          {stages.map((s) => (
            // Plain <img>: lightweight vector plates, already sized for the frame.
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
        </div>
        <figcaption className="plate__titleblock">
          <span>Courtyard House</span>
          <span>Axonometric from the south-east</span>
          <span className="plate__stage">
            Stage 0{stage.number} / 04 · {stage.title}
          </span>
          <span className="plate__key">
            <span className="plate__key-swatch" aria-hidden="true" /> Added at this stage
          </span>
        </figcaption>
      </figure>

      <div className="explorer__side">
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
        Showing stage {stage.number}, {stage.title}.
      </p>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { stages, materials, type StageId } from "@/content/stages";
import annotations from "@/content/generated/annotations.json";

type Anchors = Record<string, { id: string; label: string; x: number; y: number }[]>;
const anchors = annotations as Anchors;

/**
 * "How the house comes together": a keyboard-accessible tab set (WAI-ARIA tabs
 * pattern with automatic activation). Every drawing is rendered from the same
 * viewpoint, so switching stages shows exactly what was added.
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
      <div className="explorer__tabs" role="tablist" aria-labelledby={headingId} aria-orientation="horizontal" onKeyDown={onKeyDown}>
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
              className={`explorer__tab ${i <= index ? "is-reached" : ""}`}
              onClick={() => select(i, false)}
            >
              <span className="explorer__tab-n">0{s.number}</span>
              <span className="explorer__tab-title">{s.title}</span>
              <span className="explorer__tab-summary">{s.summary}</span>
            </button>
          );
        })}
      </div>

      <div className="explorer__body" role="tabpanel" id="stage-panel" aria-labelledby={`stage-tab-${active}`} tabIndex={0}>
        <div className="explorer__drawing">
          {stages.map((s) => (
            // Plain <img>: these are lightweight vector drawings, already sized for the frame.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.id}
              src={s.illustration.src}
              width={s.illustration.width}
              height={s.illustration.height}
              alt={s.id === active ? s.illustration.alt : ""}
              aria-hidden={s.id !== active}
              loading="lazy"
              decoding="async"
              className={`explorer__img ${s.id === active ? "is-active" : ""}`}
            />
          ))}
          <div className="explorer__marks" aria-hidden="true" key={active}>
            {(anchors[`stage-${active}`] ?? []).map((a, i) => (
              <span key={a.id} className={`marker marker--stage ${a.x > 62 ? "marker--left" : ""}`} style={{ left: `${a.x}%`, top: `${a.y}%`, animationDelay: `${120 + i * 90}ms` }}>
                <span className="marker__dot">{i + 1}</span>
                <span className="marker__label">{a.label}</span>
              </span>
            ))}
          </div>
          <p className="explorer__stamp" aria-hidden="true">
            Stage 0{stage.number} / 04 · {stage.title}
          </p>
        </div>

        <div className="explorer__text" key={active}>
          <p className="eyebrow">
            Stage 0{stage.number} of 04
          </p>
          <h3 className="explorer__title">{stage.title}</h3>
          {stage.description.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <h4 className="explorer__subhead">Added at this stage</h4>
          <ol className="explorer__added">
            {stage.added.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <h4 className="explorer__subhead">Materials</h4>
          <ul className="explorer__materials">
            {stage.modelLayers.map((layer) => (
              <li key={layer.id}>
                <span className="swatch" style={{ background: materials[layer.material].colour }} aria-hidden="true" />
                {layer.label}
              </li>
            ))}
          </ul>
          <div className="explorer__nav">
            <button type="button" className="button button--ghost" onClick={() => select(index - 1, false)} disabled={index === 0}>
              <span aria-hidden="true">←</span> Previous stage
            </button>
            <button type="button" className="button button--ghost" onClick={() => select(index + 1, false)} disabled={index === stages.length - 1}>
              Next stage <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing stage {stage.number}, {stage.title}.
      </p>
    </div>
  );
}

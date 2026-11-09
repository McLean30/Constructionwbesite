"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryView } from "@/content/courtyard-house";

interface Props {
  items: GalleryView[];
  /** Show only the first n tiles (homepage preview). The enlarged view still steps through every item. */
  preview?: number;
  /** Heading level for the tile titles. */
  headingLevel?: 3 | 4;
}

/**
 * Courtyard House gallery: captioned tiles that open an enlarged view.
 * The enlarged view is a native modal <dialog>, which keeps focus inside and closes on Escape.
 * Previous/next buttons and the arrow keys move through the views with a short crossfade
 * (none with reduced motion), and focus returns to the tile that opened it.
 */
export function Gallery({ items, preview, headingLevel = 3 }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tiles = preview ? items.slice(0, preview) : items;
  const H = `h${headingLevel}` as "h3" | "h4";
  const count = items.length;

  const show = (i: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpen(i);
  };
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);
  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open !== null && !dlg.open) {
      dlg.showModal();
      document.documentElement.classList.add("has-lightbox");
    }
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      setOpen(null);
      document.documentElement.classList.remove("has-lightbox");
      triggerRef.current?.focus();
    };
    dlg.addEventListener("close", onClose);
    return () => {
      dlg.removeEventListener("close", onClose);
      document.documentElement.classList.remove("has-lightbox");
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const current = open === null ? null : items[open];

  return (
    <>
      <ul className={`gallery-grid ${preview ? "gallery-grid--preview" : ""}`}>
        {tiles.map((item, i) => (
          <li key={item.id} className="gallery-tile">
            <button type="button" className="gallery-tile__button" onClick={(e) => show(i, e.currentTarget)} aria-haspopup="dialog">
              <span className="gallery-tile__media">
                <Image
                  src={item.image}
                  alt={item.alt}
                  sizes={preview ? "(min-width: 900px) 30vw, 100vw" : "(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 100vw"}
                  quality={80}
                  placeholder="blur"
                />
                <span className="gallery-tile__enlarge" aria-hidden="true">
                  Enlarge
                </span>
              </span>
              <span className="gallery-tile__kind">{item.kind}</span>
              <H className="gallery-tile__title">
                <span className="gallery-tile__n" aria-hidden="true">
                  0{i + 1}
                </span>
                {item.title}
                <span className="visually-hidden">, enlarge image</span>
              </H>
              <span className="gallery-tile__caption">{item.caption}</span>
            </button>
          </li>
        ))}
      </ul>
      {preview && preview < count && (
        <Link href="/gallery" className="text-link gallery-more">
          See all {count} views of Courtyard House <span aria-hidden="true">→</span>
        </Link>
      )}

      <dialog ref={dialogRef} className="lightbox" aria-labelledby="lightbox-title" onKeyDown={onKeyDown}>
        {current && (
          <div className="lightbox__inner">
            <header className="lightbox__bar">
              <p className="lightbox__count">
                {(open ?? 0) + 1} / {count}
              </p>
              <button type="button" className="lightbox__close" onClick={close} autoFocus>
                Close<span className="visually-hidden"> enlarged view</span>
                <span aria-hidden="true" className="lightbox__x" />
              </button>
            </header>
            <div className="lightbox__stage">
              {items.map((item, i) => (
                <Image
                  key={item.id}
                  src={item.image}
                  alt={i === open ? item.alt : ""}
                  aria-hidden={i !== open}
                  sizes="92vw"
                  quality={80}
                  loading={Math.abs(i - (open ?? 0)) <= 1 ? "eager" : "lazy"}
                  className={`lightbox__img ${i === open ? "is-active" : ""}`}
                />
              ))}
            </div>
            <footer className="lightbox__foot">
              <button type="button" className="lightbox__nav" onClick={() => step(-1)}>
                <span aria-hidden="true">←</span> Previous
              </button>
              <div className="lightbox__text" aria-live="polite">
                <p className="lightbox__kind">{current.kind}</p>
                <h2 id="lightbox-title" className="lightbox__title">
                  {current.title}
                </h2>
                <p className="lightbox__caption">{current.caption}</p>
              </div>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => step(1)}>
                Next <span aria-hidden="true">→</span>
              </button>
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}

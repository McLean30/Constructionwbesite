"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { nav, primaryAction, site } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu when the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // wait a frame so the panel is visible before moving focus into it
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <div className="site-header__bar">
        <Link href="/" className="wordmark" aria-label={`${site.name}, home`}>
          <span className="wordmark__mark" aria-hidden="true" />
          <span className="wordmark__name">Formwork</span>
          <span className="wordmark__sub">Construction</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <Link href={primaryAction.href} className="button button--primary button--small">
            {primaryAction.label}
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
          </span>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* always mounted so it can animate; visibility + inert keep it out of reach when closed */}
      <div id={menuId} ref={panelRef} className={`mobile-menu ${open ? "is-open" : ""}`} inert={!open} aria-hidden={!open}>
        <nav aria-label="Main, mobile">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  <span className="mobile-menu__n" aria-hidden="true">
                    0{i + 1}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={primaryAction.href} className="button button--primary" onClick={() => setOpen(false)}>
            {primaryAction.label}
          </Link>
          <p className="mobile-menu__note">A fictional builder, made for a portfolio demo.</p>
        </nav>
      </div>
    </header>
  );
}

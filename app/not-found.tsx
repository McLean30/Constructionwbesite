import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section section--narrow not-found">
      <p className="eyebrow">404 · Off the drawing</p>
      <h1 className="display">This page is not part of the plan.</h1>
      <p>The link may be out of date. Try the homepage or the Courtyard House project.</p>
      <div className="actions">
        <Link href="/" className="button button--primary">
          Back to the homepage
        </Link>
        <Link href="/projects/courtyard-house" className="button button--ghost">
          Explore Courtyard House
        </Link>
      </div>
    </section>
  );
}

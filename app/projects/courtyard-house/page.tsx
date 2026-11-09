import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnnotatedFigure } from "@/components/AnnotatedFigure";
import { courtyardHouse, gallery, heroImage } from "@/content/courtyard-house";
import { stages } from "@/content/stages";

export const metadata: Metadata = {
  title: "Courtyard House, concept project",
  description: `${courtyardHouse.openingLine} A fictional concept for the west of Scotland: two low buff-brick wings around a planted courtyard, with zinc roofs and oak joinery.`,
};

export default function CourtyardHousePage() {
  const [, ...rest] = gallery;
  return (
    <article className="project">
      {/* ---------- Opening ---------- */}
      <header className="project__hero">
        <div className="project__hero-media">
          <AnnotatedFigure
            image={heroImage.image}
            alt={heroImage.alt}
            sizes="100vw"
            priority
            fill
            objectPosition="45% 62%"
          />
        </div>
        <div className="project__hero-text">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#projects">Projects</Link>
              </li>
              <li aria-current="page">Courtyard House</li>
            </ol>
          </nav>
          <p className="tag">{courtyardHouse.label}</p>
          <h1 className="display display--xl">{courtyardHouse.title}</h1>
          <p className="project__opening">{courtyardHouse.openingLine}</p>
        </div>
      </header>

      <section className="section project__intro" aria-label="Project overview">
        <p className="project__summary">{courtyardHouse.summary}</p>
        <dl className="facts">
          {courtyardHouse.facts.map((f) => (
            <div key={f.term}>
              <dt>{f.term}</dt>
              <dd>{f.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="demo-note">Courtyard House is a fictional concept created for this demo. It has not been built, and the household described is illustrative.</p>
      </section>

      {/* ---------- Brief ---------- */}
      <section className="section split" aria-labelledby="brief-title">
        <header className="section__head">
          <p className="section__index">01</p>
          <h2 id="brief-title" className="display display--md">
            {courtyardHouse.brief.heading}
          </h2>
        </header>
        <div className="prose">
          {courtyardHouse.brief.paragraphs.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
      </section>

      {/* ---------- Layout ---------- */}
      <section className="section split split--figure" aria-labelledby="layout-title">
        <header className="section__head">
          <p className="section__index">02</p>
          <h2 id="layout-title" className="display display--md">
            {courtyardHouse.layout.heading}
          </h2>
        </header>
        <div className="prose">
          {courtyardHouse.layout.paragraphs.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <ul className="rule-list">
            {courtyardHouse.layout.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <figure className="layout-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stages[3].illustration.src}
            width={stages[3].illustration.width}
            height={stages[3].illustration.height}
            alt="Axonometric drawing of the completed Courtyard House from above: two wings joined at the street by a low link, around a paved and planted courtyard that opens to the garden."
            loading="lazy"
          />
          <figcaption>Original drawing. The two wings, the entrance link and the courtyard, seen from the south-east.</figcaption>
        </figure>
      </section>

      {/* ---------- Materials ---------- */}
      <section className="section materials" aria-labelledby="materials-title">
        <header className="section__head">
          <p className="section__index">03</p>
          <h2 id="materials-title" className="display display--md">
            Three material decisions
          </h2>
        </header>
        <ol className="materials__list">
          {courtyardHouse.materials.map((m, i) => (
            <li key={m.id} className={`material material--${m.id}`}>
              <span className="material__swatch" aria-hidden="true" />
              <p className="material__n" aria-hidden="true">
                0{i + 1}
              </p>
              <h3 className="material__title">{m.title}</h3>
              <p>{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Gallery ---------- */}
      <section className="section gallery" aria-labelledby="gallery-title">
        <header className="section__head">
          <p className="section__index">04</p>
          <h2 id="gallery-title" className="display display--md">
            Five views of the house
          </h2>
          <p className="section__lede">
            Each view is an original concept illustration or drawing of this fictional house. The captions point out what to look for.
          </p>
        </header>
        <div className="gallery__items">
          {[heroImage, ...rest].map((g) => (
            <div key={g.id} className={`gallery__item gallery__item--${g.layout}`} id={`view-${g.id}`}>
              <div className="gallery__meta">
                <p className="gallery__n">{g.number}</p>
                <h3 className="gallery__title">{g.title}</h3>
                <p className="gallery__notice">
                  <span className="gallery__notice-label">What to notice</span>
                  {g.notice}
                </p>
              </div>
              <AnnotatedFigure
                image={g.image}
                alt={g.alt}
                caption={g.caption}
                annotations={g.annotations}
                sizes={g.layout === "narrow" ? "(min-width: 960px) 46vw, 100vw" : "(min-width: 960px) 66vw, 100vw"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Stages teaser ---------- */}
      <section className="section stages-teaser" aria-labelledby="stages-title">
        <header className="section__head">
          <p className="section__index">05</p>
          <h2 id="stages-title" className="display display--md">
            Built in four stages
          </h2>
        </header>
        <ol className="stages-teaser__list">
          {stages.map((s) => (
            <li key={s.id}>
              <Image src={s.illustration.src} alt="" width={s.illustration.width} height={s.illustration.height} unoptimized loading="lazy" />
              <p className="stages-teaser__n">0{s.number}</p>
              <h3>{s.title}</h3>
              <p>{s.summary}</p>
            </li>
          ))}
        </ol>
        <Link href="/#build-process" className="text-link">
          Step through the build process <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* ---------- Closing action ---------- */}
      <section className="section closing" aria-labelledby="closing-title">
        <p className="eyebrow eyebrow--light">Thinking about something similar?</p>
        <h2 id="closing-title" className="display display--lg">
          A quiet house, open to its garden.
        </h2>
        <p>
          If Courtyard House is close to what you have in mind, start an enquiry with it as a reference. We will carry it through as your project
          context.
        </p>
        <Link href={`/enquire?project=${courtyardHouse.slug}`} className="button button--primary button--large">
          Discuss a similar project
        </Link>
      </section>
    </article>
  );
}

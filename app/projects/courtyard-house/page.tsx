import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnnotatedFigure } from "@/components/AnnotatedFigure";
import { courtyardHouse, gallery, soffitImage, visualisationImage } from "@/content/courtyard-house";
import { stages } from "@/content/stages";

export const metadata: Metadata = {
  title: "Courtyard House, concept project",
  description: `${courtyardHouse.openingLine} A fictional concept for the west of Scotland: two low buff-brick wings around a planted courtyard, with zinc roofs and oak joinery.`,
};

export default function CourtyardHousePage() {
  const view = (id: string) => gallery.find((g) => g.id === id)!;
  const garden = view("garden");
  const detail = view("detail");
  const moreViews = ["street", "interior", "construction"].map(view);

  return (
    <article className="project">
      {/* ---------- Opening: the courtyard visualisation ---------- */}
      <header className="project__hero">
        <figure className="project__hero-media">
          <Image
            src={visualisationImage.image}
            alt={visualisationImage.alt}
            sizes="100vw"
            quality={80}
            placeholder="blur"
            priority
            className="project__hero-img"
          />
          <figcaption className="hero-visual__caption">
            <span className="hero-visual__label">{visualisationImage.caption}</span>
            <span className="hero-visual__desc">{visualisationImage.description}</span>
          </figcaption>
        </figure>
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
        <p className="demo-note">
          Courtyard House is a fictional concept created for this demo and has not been built. The opening image is an AI-generated concept visualisation. The
          other views are original illustrations and drawings, so small details differ between them.
        </p>
      </section>

      {/* ---------- From the whole house to one junction ---------- */}
      <section className="section sequence" aria-labelledby="sequence-title">
        <header className="section__head">
          <p className="section__index">01</p>
          <h2 id="sequence-title" className="display display--md">
            From the whole house to one junction
          </h2>
          <p className="section__lede">
            The idea of the house holds at every scale: a calm brick body, a thin zinc lid and warm oak where the two meet.
          </p>
        </header>

        <div className="sequence__step sequence__step--whole">
          <p className="sequence__label">
            <span>A</span> The whole house
          </p>
          <AnnotatedFigure image={garden.image} alt={garden.alt} caption={garden.caption} sizes="(min-width: 1480px) 1400px, 100vw" />
          <p className="sequence__note">{garden.notice}</p>
        </div>

        <div className="sequence__pair">
          <div className="sequence__step sequence__step--crop">
            <p className="sequence__label">
              <span>B</span> Where zinc meets oak
            </p>
            <figure className="detail-crop">
              <Image src={soffitImage.image} alt={soffitImage.alt} sizes="(min-width: 960px) 422px, 100vw" quality={80} placeholder="blur" />
              <figcaption>{soffitImage.caption}</figcaption>
            </figure>
          </div>
          <div className="sequence__pair-text">
            <p className="pull-quote">A thin dark lid, a warm underside and a pale wall.</p>
            <p>
              At the end of each wing the roof runs on past the glass. From the courtyard you see three materials meet in one line: the folded zinc
              edge, the oak boards beneath it and the buff brick that carries them. The drawing below shows how that line is built.
            </p>
          </div>
        </div>

        <div className="sequence__step sequence__step--drawing">
          <p className="sequence__label">
            <span>C</span> How the junction is built
          </p>
          <AnnotatedFigure
            image={detail.image}
            alt={detail.alt}
            caption={detail.caption}
            annotations={detail.annotations}
            sizes="(min-width: 1480px) 1400px, 100vw"
            wideLabels
          />
          <p className="sequence__note">{detail.notice}</p>
        </div>
      </section>

      {/* ---------- Brief ---------- */}
      <section className="section split" aria-labelledby="brief-title">
        <header className="section__head">
          <p className="section__index">02</p>
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
          <p className="section__index">03</p>
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

      {/* ---------- Materials, each beside its detail ---------- */}
      <section className="section materials" aria-labelledby="materials-title">
        <header className="section__head">
          <p className="section__index">04</p>
          <h2 id="materials-title" className="display display--md">
            Three material decisions
          </h2>
          <p className="section__lede">Each detail is cropped from the concept visualisation.</p>
        </header>
        <ol className="materials__list">
          {courtyardHouse.materials.map((m, i) => (
            <li key={m.id} className="material">
              <figure className="material__figure">
                <Image src={m.image} alt={m.alt} sizes="(min-width: 900px) 30vw, 100vw" quality={80} placeholder="blur" />
                <figcaption className="material__label">
                  <span aria-hidden="true">0{i + 1}</span> {m.title}
                </figcaption>
              </figure>
              <h3 className="material__title">{m.title}</h3>
              <p>{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- More views ---------- */}
      <section className="section gallery" aria-labelledby="gallery-title">
        <header className="section__head">
          <p className="section__index">05</p>
          <h2 id="gallery-title" className="display display--md">
            More views of the house
          </h2>
          <p className="section__lede">Original concept illustrations and drawings of this fictional house. The notes point out what to look for.</p>
        </header>
        <div className="gallery__items">
          {moreViews.map((g) => (
            <div key={g.id} className={`gallery__item gallery__item--${g.layout}`} id={`view-${g.id}`}>
              <div className="gallery__meta">
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
          <p className="section__index">06</p>
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

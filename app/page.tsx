import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Gallery } from "@/components/Gallery";
import { HeroVisual } from "@/components/HeroVisual";
import { StageExplorer } from "@/components/StageExplorer";
import { courtyardGallery, courtyardHouse, gallery } from "@/content/courtyard-house";
import { faqs, primaryAction, services } from "@/content/site";

export default function HomePage() {
  const street = gallery.find((g) => g.id === "street")!;
  const interior = gallery.find((g) => g.id === "interior")!;

  return (
    <>
      {/* ---------- 1. Opening image and service promise ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__band">
          <div className="hero__title-block">
            <p className="eyebrow">Concept project · West of Scotland</p>
            <h1 id="hero-title" className="display hero__title">
              {courtyardHouse.title}
            </h1>
          </div>
          <div className="hero__offer">
            <p className="hero__service">New homes, extensions and renovations in Glasgow.</p>
            <div className="actions hero__actions">
              <Link href={primaryAction.href} className="button button--primary">
                {primaryAction.label}
              </Link>
              <Link href="/projects/courtyard-house" className="button button--ghost">
                Explore the house
              </Link>
            </div>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* ---------- 2. The design question and the outcome ---------- */}
      <section id="projects" className="section question" aria-labelledby="question-title">
        <header className="section__head">
          <p className="section__index">01</p>
          <p className="eyebrow">The design question</p>
          <h2 id="question-title" className="display display--md">
            How do you keep a house private from the street, and still open it fully to the garden?
          </h2>
        </header>
        <div className="question__grid">
          <figure className="question__figure question__figure--street">
            <Image src={street.image} alt={street.alt} sizes="(min-width: 960px) 52vw, 100vw" placeholder="blur" quality={80} />
            <figcaption>
              <span className="kind">Concept illustration</span> The street side: brick almost all the way.
            </figcaption>
          </figure>
          <div className="question__text">
            <p className="tag">{courtyardHouse.label} · fictional</p>
            <p className="question__lede">
              Courtyard House answers it by turning inwards. Two low wings and an entrance link wrap a planted courtyard, so every main room looks onto
              a private outdoor space instead of the road.
            </p>
            <h3 className="question__subhead">The outcome</h3>
            <ul className="rule-list">
              <li>A calm brick face to the pavement, with one oak front door</li>
              <li>Living rooms that open fully to a sheltered courtyard and garden</li>
              <li>An outdoor room you can use on an ordinary Scottish day</li>
            </ul>
            <Link href="/projects/courtyard-house" className="text-link">
              Read how the house is planned <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="question__figure question__figure--inside">
            <Image src={interior.image} alt={interior.alt} sizes="(min-width: 960px) 30vw, 70vw" placeholder="blur" quality={80} />
            <figcaption>
              <span className="kind">Concept illustration</span> Inside: the courtyard becomes the view.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- 3. Gallery preview ---------- */}
      <section id="gallery" className="section gallery-preview" aria-labelledby="gallery-title">
        <header className="section__head">
          <p className="section__index">02</p>
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-title" className="display display--md">
            See the house, one view at a time.
          </h2>
          <p className="section__lede">Each view shows something the last one didn&apos;t. Select an image to enlarge it.</p>
        </header>
        <Gallery items={courtyardGallery} preview={3} />
      </section>

      {/* ---------- 4. Services ---------- */}
      <section id="services" className="section services" aria-labelledby="services-title">
        <header className="section__head">
          <p className="section__index">03</p>
          <p className="eyebrow">Services</p>
          <h2 id="services-title" className="display display--md">
            Three kinds of project. One team on site.
          </h2>
          <p className="section__lede">Not sure which one your project is? Most homeowners aren&apos;t at the start. Tell us what you want to change and we will help you work it out.</p>
        </header>
        <ol className="services__list">
          {services.map((s) => (
            <li key={s.id} className="service">
              <p className="service__n" aria-hidden="true">
                {s.number}
              </p>
              <h3 className="service__title">{s.title}</h3>
              <p className="service__lede">{s.lede}</p>
              <h4 className="service__subhead">What it involves</h4>
              <ul className="service__list">
                {s.involves.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <h4 className="service__subhead">Choose this when</h4>
              <p className="service__when">{s.chooseWhen}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- 5. Build process: construction plate and 3D assembly ---------- */}
      <section id="build-process" className="plate-section" aria-labelledby="process-title">
        <div className="plate-section__inner">
          <header className="plate-section__head">
            <p className="eyebrow eyebrow--light">04 · Build process · Four stages</p>
            <h2 id="process-title" className="display display--lg">
              See how the house comes together.
            </h2>
            <p className="plate-section__lede">
              One drawing, one viewpoint, four stages. Choose a stage, or use the arrow keys, and the part being added is picked out in gold.
            </p>
          </header>
          <StageExplorer headingId="process-title" />
        </div>
      </section>

      {/* ---------- 6. Practical questions ---------- */}
      <section id="faq" className="section faq" aria-labelledby="faq-title">
        <div className="faq__grid">
          <header className="section__head">
            <p className="section__index">05</p>
            <p className="eyebrow">Practical questions</p>
            <h2 id="faq-title" className="display display--md">
              Before you get in touch
            </h2>
            <p className="section__lede">General guidance for homeowners in Scotland. Every project is different, so treat it as a starting point rather than advice for yours.</p>
          </header>
          <div className="faq__list">
            {faqs.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </summary>
                <div className="faq__answer">
                  {f.a.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 7. Enquiry, on limestone so the fields are easy to read ---------- */}
      <section id="enquire" className="enquire theme-light" aria-labelledby="enquire-title">
        <div className="section enquire__grid">
          <header className="section__head enquire__intro">
            <p className="section__index">06</p>
            <p className="eyebrow">Discuss your project</p>
            <h2 id="enquire-title" className="display display--md">
              Tell us what you have in mind.
            </h2>
            <p className="section__lede">Two short steps: first the project, then how to reach you. It takes about two minutes.</p>
            <p className="demo-note">
              This is a portfolio demo. The form works, but nothing is sent or saved. You will see a summary of your answers instead.
            </p>
          </header>
          <EnquiryForm headingLevel={3} />
        </div>
      </section>
    </>
  );
}

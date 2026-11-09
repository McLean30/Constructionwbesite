import Image from "next/image";
import Link from "next/link";
import { AnnotatedFigure } from "@/components/AnnotatedFigure";
import { EnquiryForm } from "@/components/EnquiryForm";
import { StageExplorer } from "@/components/StageExplorer";
import { courtyardHouse, gallery, heroImage } from "@/content/courtyard-house";
import { primaryAction, secondaryAction, services } from "@/content/site";

export default function HomePage() {
  const street = gallery.find((g) => g.id === "street")!;
  const interior = gallery.find((g) => g.id === "interior")!;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <p className="eyebrow">Residential builders · Glasgow</p>
          <h1 id="hero-title" className="display hero__title">
            New homes, extensions and renovations in Glasgow.
          </h1>
          <p className="hero__lede">
            We build houses that are calm from the street and generous to the garden. We start from the drawings and finish with the last oak board, and
            we keep you close to the work at every stage.
          </p>
          <div className="actions hero__actions">
            <Link href={primaryAction.href} className="button button--primary">
              {primaryAction.label}
            </Link>
            <Link href={secondaryAction.href} className="button button--ghost">
              {secondaryAction.label}
            </Link>
          </div>
        </div>
        <div className="hero__media">
          <AnnotatedFigure
            image={heroImage.image}
            alt={heroImage.alt}
            annotations={heroImage.annotations}
            sizes="(min-width: 960px) 66vw, 100vw"
            priority
            compactOnMobile
            caption={
              <>
                <strong>Courtyard House</strong>, garden elevation. Concept illustration.
              </>
            }
          />
        </div>
      </section>

      {/* ---------- Featured project ---------- */}
      <section id="projects" className="section feature" aria-labelledby="feature-title">
        <header className="section__head">
          <p className="section__index">01</p>
          <p className="eyebrow">Featured project</p>
        </header>
        <div className="feature__grid">
          <Link href="/projects/courtyard-house" className="feature__image" aria-hidden="true" tabIndex={-1}>
            <Image src={street.image} alt="" sizes="(min-width: 960px) 58vw, 100vw" placeholder="blur" quality={80} />
          </Link>
          <div className="feature__text">
            <p className="tag">{courtyardHouse.label}</p>
            <h2 id="feature-title" className="display display--md">
              {courtyardHouse.title}
            </h2>
            <p className="pull-quote">{courtyardHouse.openingLine}</p>
            <p>{courtyardHouse.summary}</p>
            <dl className="facts facts--compact">
              {courtyardHouse.facts.slice(1, 4).map((f) => (
                <div key={f.term}>
                  <dt>{f.term}</dt>
                  <dd>{f.detail}</dd>
                </div>
              ))}
            </dl>
            <Link href="/projects/courtyard-house" className="text-link">
              Read the Courtyard House story <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="feature__inset">
            <Image src={interior.image} alt={interior.alt} sizes="(min-width: 960px) 30vw, 60vw" placeholder="blur" quality={80} />
            <figcaption>From the living room into the courtyard. Concept illustration.</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="section services" aria-labelledby="services-title">
        <header className="section__head">
          <p className="section__index">02</p>
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

      {/* ---------- Build process ---------- */}
      <section id="build-process" className="section process" aria-labelledby="process-title">
        <header className="section__head">
          <p className="section__index">03</p>
          <p className="eyebrow">Build process</p>
          <h2 id="process-title" className="display display--md">
            How the house comes together
          </h2>
          <p className="section__lede">
            Courtyard House in four stages, all drawn from the same viewpoint. Choose a stage, or use the arrow keys, to see what is added and why. New work
            is outlined in orange.
          </p>
        </header>
        <StageExplorer headingId="process-title" />
      </section>

      {/* ---------- Enquiry ---------- */}
      <section id="enquire" className="section enquire" aria-labelledby="enquire-title">
        <div className="enquire__grid">
          <header className="section__head enquire__intro">
            <p className="section__index">04</p>
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

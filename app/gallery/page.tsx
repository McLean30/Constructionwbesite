import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "@/components/Gallery";
import { courtyardGallery } from "@/content/courtyard-house";

export const metadata: Metadata = {
  title: "Gallery: Courtyard House",
  description: "Six views of Courtyard House, a fictional concept: the courtyard, the street approach, the interior, a material detail and two construction drawings.",
};

export default function GalleryPage() {
  return (
    <section className="section gallery-page" aria-labelledby="gallery-page-title">
      <header className="section__head">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-current="page">Gallery</li>
          </ol>
        </nav>
        <p className="tag">Concept project · fictional</p>
        <h1 id="gallery-page-title" className="display display--lg">
          Courtyard House, view by view
        </h1>
        <p className="section__lede">
          Six views, in the order that explains the house: the courtyard, the street, the rooms, the materials and how it is built. Each is labelled
          as an AI-generated concept visualisation, a crop of it, an original illustration or a construction drawing. None is a photograph of a
          built house.
        </p>
      </header>
      <Gallery items={courtyardGallery} headingLevel={3} />
      <div className="gallery-page__next">
        <Link href="/projects/courtyard-house" className="text-link">
          Read the Courtyard House story <span aria-hidden="true">→</span>
        </Link>
        <Link href="/enquire?project=courtyard-house" className="button button--primary">
          Discuss a similar project
        </Link>
      </div>
    </section>
  );
}

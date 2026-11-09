import { getImageProps } from "next/image";
import { visualisationImage } from "@/content/courtyard-house";

/**
 * Server-rendered, art-directed hero image.
 * Wider screens get the full frame (both rooflines and the view through the courtyard);
 * phones get a square crop centred on the courtyard and the glazed living room.
 */
export function HeroVisual() {
  const common = { alt: visualisationImage.alt, quality: 80 };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: visualisationImage.image, sizes: "(min-width: 1480px) 1400px, 100vw" });
  const {
    props: { srcSet: phone, ...img },
  } = getImageProps({ ...common, src: visualisationImage.phone, sizes: "100vw" });

  return (
    <figure className="hero-visual">
      <picture>
        <source media="(min-width: 700px)" srcSet={wide} width={visualisationImage.image.width} height={visualisationImage.image.height} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
        <img {...img} srcSet={phone} className="hero-visual__img" fetchPriority="high" loading="eager" decoding="async" />
      </picture>
      <figcaption className="hero-visual__caption">
        <span className="hero-visual__label">{visualisationImage.caption}</span>
        <span className="hero-visual__desc">{visualisationImage.description}</span>
      </figcaption>
    </figure>
  );
}

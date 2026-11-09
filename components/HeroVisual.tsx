import { getImageProps } from "next/image";
import { visualisationImage } from "@/content/courtyard-house";

/**
 * Roof edge traced in source-image pixels (1672 x 941): the link's fascia where it meets the
 * lit oak soffit, up the east wing's eaves, then along the gable verge against the sky.
 * Measured on the original file and checked zoomed in; see scripts/art/roofline.md.
 */
const ROOFLINE = [
  [740, 411],
  [1274, 394],
  [1378, 168],
  [1384, 160],
  [1584, 0],
] as const;
/** The phone crop starts 540 px in from the left of the source (scripts/art/crop-visualisation.mjs). */
const PHONE_CROP_LEFT = 540;

const toPath = (dx: number) => "M" + ROOFLINE.map(([x, y]) => `${x - dx} ${y}`).join("L");

/**
 * Server-rendered, art-directed hero image with a one-off gold roofline.
 * Wider screens get the full frame (both rooflines and the view through the courtyard);
 * phones get a square crop centred on the courtyard and the glazed living room.
 * Each crop has its own overlay, scaled exactly like the image beneath it.
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
      {/* wide crop: the image is only ever trimmed from the bottom (object-position 50% 0%), so
          "xMidYMin slice" scales this overlay exactly as object-fit: cover scales the photo */}
      <svg className="roofline roofline--wide" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
        <path d={toPath(0)} pathLength={1} />
      </svg>
      <svg className="roofline roofline--phone" viewBox="0 0 940 941" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
        <path d={toPath(PHONE_CROP_LEFT)} pathLength={1} />
      </svg>
      <figcaption className="hero-visual__caption">
        <span className="hero-visual__label">{visualisationImage.caption}</span>
        <span className="hero-visual__desc">{visualisationImage.description}</span>
      </figcaption>
    </figure>
  );
}

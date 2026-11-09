import Image, { type StaticImageData } from "next/image";
import type { Annotation } from "@/content/courtyard-house";

interface Props {
  image: StaticImageData;
  alt: string;
  caption?: React.ReactNode;
  annotations?: Annotation[];
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Crop to fill the parent instead of keeping the image's aspect ratio. */
  fill?: boolean;
  objectPosition?: string;
  /** Hide the labels and legend on phones, where they would push the next action off screen. */
  compactOnMobile?: boolean;
}

/**
 * An image with drawing-style annotations. Labels are positioned over the image
 * on wider screens; on phones they become numbered markers with a legend below.
 * The overlay is decorative (the alt text and legend carry the information).
 */
export function AnnotatedFigure({ image, alt, caption, annotations = [], sizes, priority, className, fill, objectPosition, compactOnMobile }: Props) {
  return (
    <figure className={`annotated ${fill ? "annotated--fill" : ""} ${compactOnMobile ? "annotated--compact" : ""} ${className ?? ""}`}>
      <div className="annotated__frame">
        <Image
          src={image}
          alt={alt}
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          quality={80}
          className="annotated__img"
          style={objectPosition ? { objectPosition } : undefined}
        />
        {annotations.length > 0 && (
          <div className="annotated__overlay" aria-hidden="true">
            {annotations.map((a, i) => (
              <span
                key={a.id}
                className={`marker ${a.x > 62 ? "marker--left" : ""}`}
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
              >
                <span className="marker__dot">{i + 1}</span>
                <span className="marker__label">{a.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {(caption || annotations.length > 0) && (
        <figcaption className="annotated__caption">
          {caption && <span className="annotated__text">{caption}</span>}
          {annotations.length > 0 && (
            <ol className="annotated__legend">
              {annotations.map((a, i) => (
                <li key={a.id}>
                  <span className="legend__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  {a.label}
                </li>
              ))}
            </ol>
          )}
        </figcaption>
      )}
    </figure>
  );
}

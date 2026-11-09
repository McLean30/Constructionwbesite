import type { StaticImageData } from "next/image";
import garden from "@/public/images/courtyard-house-garden.webp";
import street from "@/public/images/courtyard-house-street.webp";
import interior from "@/public/images/courtyard-house-interior.webp";
import detail from "@/public/images/courtyard-house-detail.webp";
import construction from "@/public/images/courtyard-house-construction.webp";
import annotations from "@/content/generated/annotations.json";

export interface Annotation {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GalleryItem {
  id: string;
  number: string;
  title: string;
  image: StaticImageData;
  alt: string;
  caption: string;
  notice: string;
  annotations: Annotation[];
  /** Portrait or detail images sit in a narrower column. */
  layout: "wide" | "narrow";
}

export const courtyardHouse = {
  slug: "courtyard-house",
  title: "Courtyard House",
  label: "Concept project",
  openingLine: "A quiet face to the street. A house that opens to the garden.",
  summary:
    "Two low wings shelter a planted courtyard. The street elevation stays quiet and mostly solid. The garden elevation opens through full-height glazing beneath a deep, timber-lined soffit.",
  facts: [
    { term: "Status", detail: "Concept design" },
    { term: "Setting", detail: "Suburban plot, west of Scotland" },
    { term: "Type", detail: "New build, single storey" },
    { term: "Layout", detail: "Two wings around a courtyard" },
    { term: "Materials", detail: "Buff brick, zinc and oak" },
  ],
  brief: {
    heading: "The homeowners' brief",
    paragraphs: [
      "The concept starts with a household of four: two adults, two young children and a grandparent who stays for weeks at a time. They wanted everything on one level, a house the grandparent could move through easily, and rooms that felt connected to the garden without feeling exposed to the street.",
      "Their brief came down to four lines. Keep the front private. Let the living spaces open fully to the garden. Make an outdoor room that is usable on an ordinary Scottish day, not only on a warm one. Choose materials that will look better in twenty years than they do on handover.",
    ],
  },
  layout: {
    heading: "The courtyard layout",
    paragraphs: [
      "Two parallel wings run back from the street. The west wing holds the living room and a quiet sitting room; the east wing holds the kitchen and dining space; bedrooms sit at the street end of both. A low entrance link joins them along the pavement, so the front door is set into a single calm brick wall.",
      "The courtyard sits between the wings: enclosed on three sides, open to the garden on the fourth. Every main room has a window or glazed door onto it, so the courtyard becomes the centre of the house and the way you move around it.",
    ],
    points: [
      "Street side: brick almost all the way, with one oak door and two narrow windows",
      "Courtyard: paved in sandstone, planted beds along each wing and a multi-stem tree",
      "Garden side: each wing ends in a full-width glazed screen under a 1.6 m overhang",
    ],
  },
  materials: [
    {
      id: "brick",
      title: "Pale buff brick",
      text: "A pale brick catches the soft, grey daylight of the west of Scotland and holds it. It echoes the blond sandstone of older Glasgow villas without imitating it, and it lets the street elevation be quiet and solid without feeling heavy.",
    },
    {
      id: "zinc",
      title: "Dark standing-seam zinc",
      text: "Zinc suits a low roof pitch and can be folded cleanly over the deep garden overhang, so the roof reads as one thin, dark lid. The standing seams run down the slope and give the roof a fine texture against the brick.",
    },
    {
      id: "oak",
      title: "Oak joinery",
      text: "Oak is used wherever people touch or look closely: the entrance door, window and door frames, and the soffit boards under the overhang. The same timber runs from the living room ceiling to the terrace, joining inside and outside.",
    },
  ],
};

const a = annotations as Record<string, Annotation[]>;

export const gallery: GalleryItem[] = [
  {
    id: "garden",
    number: "01",
    title: "Garden elevation",
    image: garden,
    alt: "Illustration of the Courtyard House from the garden: two low buff-brick wings with dark zinc roofs and full-height oak-framed glazing, a planted courtyard with a multi-stem tree between them, and an adult and child on the terrace.",
    caption: "Concept illustration. Wide view of the garden elevation in soft daylight, showing both wings and the courtyard between them.",
    notice:
      "Notice how the two gable ends are almost entirely glass below the brick, while the deep overhangs and timber soffits cut glare and keep rain off the terrace. The courtyard stays visible right through the middle of the house.",
    annotations: a.hero,
    layout: "wide",
  },
  {
    id: "street",
    number: "02",
    title: "Street approach",
    image: street,
    alt: "Illustration of the Courtyard House from the pavement: an oblique view of a long, mostly solid buff-brick frontage with two gables, a low link containing an oak front door and a narrow window, behind a low brick wall and hedge.",
    caption: "Concept illustration. Oblique view from the pavement, showing the entrance in the low link and the brickwork of both gables.",
    notice:
      "From the street the house gives very little away. The entrance is set into the lower link between the two gables, and the brick boundary wall and hedge continue the same quiet line.",
    annotations: a.street,
    layout: "wide",
  },
  {
    id: "interior",
    number: "03",
    title: "Living space",
    image: interior,
    alt: "Interior illustration: a living room with an oak floor and exposed timber rafters, a person on a sofa looking out through a large oak-framed window into the sheltered courtyard, where someone sits on a bench beneath a multi-stem tree.",
    caption: "Concept illustration. From the living space in the west wing, looking across the courtyard to the kitchen wing.",
    notice:
      "The courtyard works like an extra room. You look across it to the brick of the other wing, so the view is green and private rather than open to the neighbours. The garden-side glazing on the right brings in a second source of daylight.",
    annotations: [],
    layout: "wide",
  },
  {
    id: "detail",
    number: "04",
    title: "Roof, soffit and brick",
    image: detail,
    alt: "Construction section drawing of the garden overhang: standing-seam zinc on a plywood deck over rafters, oak soffit boards beneath the overhang, a folded zinc fascia, and a cavity wall of buff brick, insulation and blockwork above a painted steel beam and oak glazing frame.",
    caption: "Original detail drawing. Section through the garden overhang, where the zinc roof, oak soffit and buff brick gable meet above the glazing.",
    notice:
      "Notice how each material stops cleanly against the next. The zinc folds down to form a drip, the oak boards run out to meet it, and the brick sits on its own steel angle, so the glazing below can be as tall as possible.",
    annotations: a.detail,
    layout: "wide",
  },
  {
    id: "construction",
    number: "05",
    title: "How it fits together",
    image: construction,
    alt: "Exploded axonometric drawing of the Courtyard House in four tiers: concrete slabs on the site, blockwork walls with orange steel frames and timber rafters, brick walls with glazing and zinc roofs, and finally oak joinery, soffits, paving, planting and people.",
    caption: "Original drawing. Exploded axonometric of the four construction stages, stacked in the order they are built.",
    notice:
      "Read it from the bottom up. Each tier is one stage of the build, drawn from the same viewpoint so you can trace a wall from its slab, through its structure and brick, to the finished room.",
    annotations: [],
    layout: "narrow",
  },
];

export const heroImage = gallery[0];
export const projects = { [courtyardHouse.slug]: courtyardHouse };

export const site = {
  name: "Formwork Construction",
  shortName: "Formwork",
  city: "Glasgow",
  description:
    "Formwork Construction is a fictional Glasgow residential builder created for a portfolio demo: new homes, extensions and renovations, told through the Courtyard House concept.",
  demoNotice:
    "Formwork Construction is a fictional company created for a portfolio demo. The projects, people and details on this site are illustrative. Nothing you enter is sent anywhere.",
};

export const nav = [
  { href: "/#projects", label: "Projects" },
  { href: "/#services", label: "Services" },
  { href: "/#build-process", label: "Build process" },
];

export const primaryAction = { href: "/enquire", label: "Discuss your project" };
export const secondaryAction = { href: "/projects/courtyard-house", label: "Explore Courtyard House" };

export interface Service {
  id: string;
  number: string;
  title: string;
  lede: string;
  involves: string[];
  chooseWhen: string;
}

export const services: Service[] = [
  {
    id: "new-builds",
    number: "01",
    title: "New builds",
    lede: "A complete house on an empty or cleared plot, built from the ground up around how you want to live.",
    involves: [
      "Ground investigation, setting out and foundations",
      "Working from your architect's drawings and building warrant",
      "Structure, envelope and services through to the final finishes",
      "One site lead from the first peg in the ground to handover",
    ],
    chooseWhen:
      "You have a plot, or are about to buy one, and want a house designed around your household rather than adapted to it.",
  },
  {
    id: "extensions",
    number: "02",
    title: "Extensions",
    lede: "New rooms joined carefully to the house you already have, often to open it up to the garden.",
    involves: [
      "Tying new foundations and walls into the existing structure",
      "Steel frames to form wide openings in old walls",
      "Matching existing materials or contrasting with them on purpose",
      "Phasing the work so part of the house stays usable",
    ],
    chooseWhen:
      "You like where you live but need more space, more light or a better connection between the kitchen and the garden.",
  },
  {
    id: "renovations",
    number: "03",
    title: "Renovations",
    lede: "Bringing a tired, cold or awkward house up to date without losing what makes it worth keeping.",
    involves: [
      "Condition surveys and careful stripping out",
      "Structural repairs, new insulation and replacement windows",
      "Rewiring, new heating and new kitchens and bathrooms",
      "Reworking layouts that were designed for a different era",
    ],
    chooseWhen:
      "The bones of the house are good, whether a tenement flat, a villa or a post-war semi, but it no longer works for the way you live.",
  },
];

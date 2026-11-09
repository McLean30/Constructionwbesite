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
  { href: "/gallery", label: "Gallery" },
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

export interface Faq {
  q: string;
  a: string[];
}

/** Practical questions homeowners ask before an enquiry. General guidance, not a quote or legal advice. */
export const faqs: Faq[] = [
  {
    q: "Will I need planning permission and a building warrant?",
    a: [
      "Usually both, for a new house. In Scotland, most new homes and many extensions need planning permission from the local council, and almost all building work needs a building warrant before it starts. Some smaller extensions count as permitted development and don't need planning permission, but they still need a warrant.",
      "Your architect or designer normally prepares and submits the applications. We build to the approved warrant drawings and arrange the council's inspections as the work goes up.",
    ],
  },
  {
    q: "When should I bring a builder in?",
    a: [
      "Once you have a design direction, before the drawings are finished. A builder can price options early, point out what is costly to build and help the drawings and the budget meet in the middle.",
    ],
  },
  {
    q: "Can we stay at home while the work happens?",
    a: [
      "Often yes for an extension: we can phase the work so the existing house stays usable, and break through only near the end. For a full renovation with new wiring, heating and floors, most families move out for at least part of the job. We will tell you honestly which applies once we have seen the house.",
    ],
  },
  {
    q: "How is the work priced?",
    a: [
      "From the drawings and a written specification. The price lists what is included, any provisional sums for items not yet chosen, and how changes will be agreed and costed before they are made, so nothing is added without your say-so.",
    ],
  },
  {
    q: "How long will it take?",
    a: [
      "It depends on the size of the job, the ground and the time of year. With the price we give you a programme: when each stage, from foundations to finishes, should start and finish, and when you will need to make decisions.",
    ],
  },
  {
    q: "Is Formwork a real company?",
    a: [
      "No. Formwork Construction and Courtyard House are fictional, made for a portfolio demo. The enquiry form works, but nothing you enter is sent or stored.",
    ],
  },
];

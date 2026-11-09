/**
 * Construction stages for Courtyard House.
 *
 * This file is the single source of truth for the stage explorer (milestone one)
 * and the interactive 3D assembly (milestone two). It is plain data with no
 * framework imports so that both the Next.js app and the Node art pipeline
 * (scripts/art) can read it.
 *
 * - `modelLayers` name the groups of geometry that belong to each stage. The art
 *   pipeline refuses to draw any object whose layer is not listed here, so the
 *   2D drawings and the future React Three Fiber scene share one vocabulary.
 * - `illustration` is the drawing shown in milestone one, rendered from the same
 *   viewpoint for every stage so visitors can compare what was added.
 */

export type StageId = "foundations" | "structure" | "envelope" | "finish";

export interface ModelLayer {
  /** Stable identifier, used as the node/group name in the 3D scene. */
  id: string;
  /** Human readable label for legends and accessible descriptions. */
  label: string;
  /** Material key, shared with `materials` below. */
  material: MaterialId;
}

export type MaterialId =
  | "concrete"
  | "blockwork"
  | "steel"
  | "softwood"
  | "buff-brick"
  | "glass"
  | "zinc"
  | "oak"
  | "plaster"
  | "stone"
  | "planting";

export interface Stage {
  id: StageId;
  number: number;
  title: string;
  /** One-line summary used in the selector. */
  summary: string;
  /** Explanation shown beside the drawing. */
  description: string[];
  /** Short notes on what to look for in the drawing. */
  added: string[];
  /** Drawing anchor ids, in the same order as `added`, numbered on the plate. */
  markers: string[];
  illustration: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  /** The same drawing as a graphite construction plate (homepage explorer). */
  plate: {
    src: string;
    width: number;
    height: number;
  };
  modelLayers: ModelLayer[];
  /** Camera hint for milestone two: progress through the assembly, 0 to 1. */
  assemblyProgress: number;
}

export const materials: Record<MaterialId, { label: string; colour: string }> = {
  concrete: { label: "Cast concrete", colour: "#bdbab2" },
  blockwork: { label: "Dense concrete blockwork", colour: "#c9c7c0" },
  steel: { label: "Painted steel", colour: "#4b5156" },
  softwood: { label: "Structural softwood", colour: "#d8c29a" },
  "buff-brick": { label: "Pale buff brick", colour: "#d9c6a0" },
  glass: { label: "Triple glazing", colour: "#9fb3b8" },
  zinc: { label: "Dark standing-seam zinc", colour: "#3b3f42" },
  oak: { label: "European oak", colour: "#b88a55" },
  plaster: { label: "Lime plaster", colour: "#ebe6dc" },
  stone: { label: "Sandstone paving", colour: "#cfc6b4" },
  planting: { label: "Courtyard planting", colour: "#6f7f55" },
};

const drawing = (id: StageId, alt: string) => ({
  src: `/stages/${id}.svg`,
  width: 1600,
  height: 1100,
  alt,
});

const plate = (id: StageId) => ({ src: `/stages/plate-${id}.svg`, width: 1600, height: 920 });

export const stages: Stage[] = [
  {
    id: "foundations",
    number: 1,
    title: "Foundations",
    summary: "Setting out the footprint, slab and courtyard void.",
    description: [
      "Everything starts with setting out. The two wings are pegged out either side of the garden, joined at the street by a low entrance link, so the courtyard is fixed before a single wall goes up.",
      "Strip footings run under every load-bearing wall and an insulated ground-bearing slab is cast inside each wing. The courtyard is left as a void: it will be drained, levelled and planted rather than built over.",
    ],
    added: [
      "Setting-out grid for both wings and the link",
      "Insulated concrete slab under each wing",
      "Courtyard void left open to the sky",
    ],
    markers: ["grid", "slab", "void"],
    plate: plate("foundations"),
    illustration: drawing(
      "foundations",
      "Axonometric drawing of the Courtyard House site with only the concrete slabs in place: a U-shaped footprint of two long wings joined at the street, around an empty hatched courtyard.",
    ),
    modelLayers: [
      { id: "site-base", label: "Site plate", material: "stone" },
      { id: "setting-out-grid", label: "Setting-out grid", material: "steel" },
      { id: "ground-slab", label: "Ground-bearing slab", material: "concrete" },
      { id: "courtyard-void", label: "Courtyard void", material: "stone" },
    ],
    assemblyProgress: 0.25,
  },
  {
    id: "structure",
    number: 2,
    title: "Structure",
    summary: "Load-bearing walls, roof timbers and the garden opening.",
    description: [
      "The inner leaf of blockwork goes up on the slab and carries the roof. It is the part of the wall you will eventually plaster and live against.",
      "At each garden gable, a painted steel goalpost frame takes the place of a wall. Its beam carries the gable above, so the full width of each wing can open to the garden. Softwood rafters and a ridge beam then set the low roof pitch.",
    ],
    added: [
      "Blockwork inner leaf on the slab",
      "Steel goalpost frames forming the garden openings",
      "Ridge beams and rafters for both wings",
    ],
    markers: ["block", "goalpost", "rafters"],
    plate: plate("structure"),
    illustration: drawing(
      "structure",
      "The same axonometric view with blockwork walls on the slabs, steel goalpost frames at the garden end of each wing and open timber rafters over both roofs, all picked out in gold as the parts added at this stage.",
    ),
    modelLayers: [
      { id: "blockwork-inner-leaf", label: "Blockwork inner leaf", material: "blockwork" },
      { id: "steel-goalpost-frames", label: "Steel goalpost frames", material: "steel" },
      { id: "roof-timbers", label: "Ridge beams and rafters", material: "softwood" },
    ],
    assemblyProgress: 0.5,
  },
  {
    id: "envelope",
    number: 3,
    title: "Envelope",
    summary: "Brick, glazing and zinc make the house weathertight.",
    description: [
      "An outer leaf of pale buff brick wraps the blockwork, with an insulated cavity between them. On the street side it stays almost solid, which keeps the house private from the pavement.",
      "Large glazed screens fill the garden openings and the courtyard walls. The roofs are boarded, then covered in dark standing-seam zinc that runs down the slope and folds over the deep garden overhang. At this point the house is enclosed and weathertight.",
    ],
    added: [
      "Pale buff brick outer leaf",
      "Glazed screens to the garden and courtyard",
      "Standing-seam zinc roofs with deep garden overhangs",
    ],
    markers: ["brick", "glazing", "zinc"],
    plate: plate("envelope"),
    illustration: drawing(
      "envelope",
      "The same view with buff brick walls, large glass screens to the garden and courtyard, and dark zinc roofs with standing seams overhanging the garden ends.",
    ),
    modelLayers: [
      { id: "brick-outer-leaf", label: "Buff brick outer leaf", material: "buff-brick" },
      { id: "glazing", label: "Glazed screens", material: "glass" },
      { id: "zinc-roof", label: "Standing-seam zinc roof", material: "zinc" },
    ],
    assemblyProgress: 0.75,
  },
  {
    id: "finish",
    number: 4,
    title: "Finish",
    summary: "Oak, timber soffits, interiors and the planted courtyard.",
    description: [
      "Oak frames and doors go into the openings and an oak-lined soffit is fixed beneath each garden overhang. The soffit carries the timber from inside out to the terrace.",
      "Inside, floors and plaster are finished. Outside, the courtyard is paved in sandstone and planted with a multi-stem tree and low beds. It is now the sheltered outdoor room the plan was laid out around.",
    ],
    added: [
      "Oak joinery and entrance door",
      "Timber-lined soffits to the garden overhangs",
      "Floor finishes, sandstone paving and courtyard planting",
    ],
    markers: ["oak", "soffit", "courtyard"],
    plate: plate("finish"),
    illustration: drawing(
      "finish",
      "The completed Courtyard House in the same axonometric view, with oak-lined soffits, a paved and planted courtyard with a tree, and people using the garden terrace.",
    ),
    modelLayers: [
      { id: "oak-joinery", label: "Oak joinery", material: "oak" },
      { id: "timber-soffits", label: "Timber-lined soffits", material: "oak" },
      { id: "interior-finishes", label: "Interior finishes", material: "plaster" },
      { id: "courtyard-planting", label: "Courtyard paving and planting", material: "planting" },
    ],
    assemblyProgress: 1,
  },
];

export const stageIds = stages.map((s) => s.id);

/** Every layer id in assembly order, flattened. */
export const allModelLayers = stages.flatMap((s) =>
  s.modelLayers.map((layer) => ({ ...layer, stage: s.id })),
);

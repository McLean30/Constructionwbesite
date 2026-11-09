# Asset provenance

Formwork Construction and Courtyard House are fictional. Every image on the site depicts that fictional house. No photographs or stock images are used, and nothing is loaded from a remote host.

There are two kinds of imagery:

1. **One AI-generated concept visualisation**, supplied by the repository owner (below).
2. **Original illustrations and drawings** made in this repository. Image generation was not available when they were made, so they were drawn from scratch. The 3D views are rendered from a single procedural model of the Courtyard House by a small vector renderer written for this project. The scripts that produce every image are in the repository, so any image can be regenerated exactly:

```bash
npm run art
```

## AI-generated concept visualisation

| | |
| --- | --- |
| Source file | `assets-src/courtyard-house-visualisation-original.webp` (1672 × 941 px WebP, 385,644 bytes, SHA-256 `a5f9ced63293cc07488a71b80bc6e09fa47098c6f3743e29cf4648edc9403116`) |
| Provenance | **AI-generated concept visualisation**, supplied by the repository owner as a chat attachment on 9 November 2026 for the `feature/courtyard-visual-pass` revision. The generating tool and prompt were not supplied. |
| Depicts | The courtyard of the fictional Courtyard House at dusk after rain: two buff-brick wings with standing-seam zinc roofs, wet sandstone paving, birch trees and the glazed living room with a fire under a timber-lined soffit. Not a photograph of a real building. |
| Rights | Used here as the owner's own concept material for this portfolio demo. Check the terms of the image generator before any wider commercial use. |
| Labelling | Captioned "Concept visualisation" wherever it appears. The project page says the image is AI-generated and that small details differ from the construction drawings. |

Derived files, all made by `npm run crops` (`scripts/art/crop-visualisation.mjs`) with no retouching:

| File | Crop (left, top, width × height) | Used for |
| --- | --- | --- |
| `public/images/courtyard-house-visualisation.webp` | full frame, copied byte for byte | Homepage hero (desktop) and project page opening |
| `public/images/courtyard-house-visualisation-phone.webp` | 540, 0, 940 × 941 | Homepage hero on phones: courtyard and glazed living room |
| `public/images/courtyard-house-visualisation-soffit.webp` | 1250, 150, 422 × 300 | Project sequence: zinc roof edge meeting the oak soffit |
| `public/images/courtyard-house-material-zinc.webp` | 90, 40, 520 × 300 | Material decision: zinc |
| `public/images/courtyard-house-material-brick.webp` | 300, 340, 220 × 300 | Material decision: brick |
| `public/images/courtyard-house-material-oak.webp` | 1262, 300, 180 × 300 | Material decision: oak |

Responsive sizes (AVIF and WebP) are generated at request time by `next/image`. The source is 1672 px wide, so screens wider than that, and the small material crops, are shown at the source's own resolution or slightly enlarged.

## Original illustrations and drawings

| File | What it shows | How it was made | Licence |
| --- | --- | --- | --- |
| `public/images/courtyard-house-garden.webp` (master: `art/courtyard-house-garden.svg`) | Garden elevation (project sequence: the whole house) with both wings, the courtyard and terrace | Perspective render of the model in `scripts/art/model.mjs` by `scripts/art/engine.mjs`; sky, hills and trees drawn procedurally in `scripts/art/build-art.mjs` | Original work, same licence as this repository |
| `public/images/courtyard-house-street.webp` (`art/courtyard-house-street.svg`) | Street approach: oblique view of the entrance link and brickwork | Same model and renderer, street camera | Original work |
| `public/images/courtyard-house-interior.webp` (`art/courtyard-house-interior.svg`) | Interior: from the west wing sitting room into the courtyard | Hand-composed one-point perspective in `scripts/art/views2d.mjs` | Original work |
| `public/images/courtyard-house-detail.webp` (`art/courtyard-house-detail.svg`) | Detail: section through the zinc roof, oak soffit and buff brick junction | Hand-composed construction section in `scripts/art/views2d.mjs` | Original work |
| `public/images/courtyard-house-construction.webp` (`art/courtyard-house-construction.svg`) | Construction: exploded axonometric of the four stages | Same model, rendered tier by tier using the stage layers in `content/stages.ts` | Original work |
| `public/stages/foundations.svg`, `structure.svg`, `envelope.svg`, `finish.svg` | Stage drawings on paper (project page), all from one axonometric viewpoint | Same model; each drawing adds that stage's layers and outlines them in orange | Original work |
| `public/stages/plate-*.svg` | The same four stages as graphite construction plates (homepage) | Same model and camera, graphite theme; new parts tinted and outlined in safety orange | Original work |
| `content/generated/annotations.json` | Positions of material labels and stage markers | Projected from 3D anchor points by the same camera as each image | Original work |

All illustrations are labelled on the site as "concept illustration" or "original drawing". None of them is presented as a photograph.

## Fonts

| Font | Source | Licence |
| --- | --- | --- |
| Barlow Condensed (500, 600, 700) | `@fontsource/barlow-condensed`, self-hosted from `node_modules` at build time | SIL Open Font License 1.1 |
| Public Sans (variable) | `@fontsource-variable/public-sans`, self-hosted | SIL Open Font License 1.1 |

## People and content

The household, design brief and design details are fictional. There are no testimonials, awards, completed contracts, budgets or performance results. The figures in the illustrations are generic silhouettes for scale and do not depict anyone.

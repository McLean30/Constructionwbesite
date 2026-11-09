# Asset provenance

Formwork Construction and Courtyard House are fictional. Every image on the site depicts that fictional house. **No photographs, stock images or third-party artwork are used**, and nothing is loaded from a remote host.

Image generation was not available while this milestone was built. So, rather than mix in photographs of other buildings, all imagery was drawn from scratch as original architectural illustration. The 3D views are rendered from a single procedural model of the Courtyard House by a small vector renderer written for this project. The scripts that produce every image are in the repository, so any image can be regenerated exactly:

```bash
npm run art
```

## Images

| File | What it shows | How it was made | Licence |
| --- | --- | --- | --- |
| `public/images/courtyard-house-garden.webp` (master: `art/courtyard-house-garden.svg`) | Hero: garden elevation with both wings, the courtyard and terrace | Perspective render of the model in `scripts/art/model.mjs` by `scripts/art/engine.mjs`; sky, hills and trees drawn procedurally in `scripts/art/build-art.mjs` | Original work, same licence as this repository |
| `public/images/courtyard-house-street.webp` (`art/courtyard-house-street.svg`) | Street approach: oblique view of the entrance link and brickwork | Same model and renderer, street camera | Original work |
| `public/images/courtyard-house-interior.webp` (`art/courtyard-house-interior.svg`) | Interior: from the living space into the courtyard | Hand-composed one-point perspective in `scripts/art/views2d.mjs` | Original work |
| `public/images/courtyard-house-detail.webp` (`art/courtyard-house-detail.svg`) | Detail: section through the zinc roof, oak soffit and buff brick junction | Hand-composed construction section in `scripts/art/views2d.mjs` | Original work |
| `public/images/courtyard-house-construction.webp` (`art/courtyard-house-construction.svg`) | Construction: exploded axonometric of the four stages | Same model, rendered tier by tier using the stage layers in `content/stages.ts` | Original work |
| `public/stages/foundations.svg`, `structure.svg`, `envelope.svg`, `finish.svg` | Stage explorer drawings, all from one axonometric viewpoint | Same model; each drawing adds that stage's layers and outlines them in orange | Original work |
| `content/generated/annotations.json` | Positions of material labels and stage markers | Projected from 3D anchor points by the same camera as each image | Original work |

All illustrations are labelled on the site as "concept illustration" or "original drawing". None of them is presented as a photograph.

## Fonts

| Font | Source | Licence |
| --- | --- | --- |
| Barlow Condensed (500, 600, 700) | `@fontsource/barlow-condensed`, self-hosted from `node_modules` at build time | SIL Open Font License 1.1 |
| Public Sans (variable) | `@fontsource-variable/public-sans`, self-hosted | SIL Open Font License 1.1 |

## People and content

The household, design brief and design details are fictional. There are no testimonials, awards, completed contracts, budgets or performance results. The figures in the illustrations are generic silhouettes for scale and do not depict anyone.

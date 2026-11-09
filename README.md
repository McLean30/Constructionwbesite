# Formwork Construction: portfolio demo

A portfolio demo for **Formwork Construction**, a fictional Glasgow residential builder (new builds, extensions and renovations). The site is built around **Courtyard House**, a fictional concept: two low buff-brick wings around a planted courtyard, with dark zinc roofs and oak joinery.

> Formwork is fictional. The site is kept out of search indexes, and the enquiry form never sends or stores anything.

## Milestone one (this branch)

- **Homepage** (`/`): image-led hero with both actions, the featured Courtyard House story, three services, the interactive *How the house comes together* stage explorer, a demo enquiry and a footer that labels the site as fictional.
- **Project page** (`/projects/courtyard-house`): flagship image, *Concept project* label, the homeowners' brief, the courtyard layout, three material decisions, five captioned views and *Discuss a similar project*.
- **Enquiry** (`/enquire`, also embedded on the homepage): a two-step form. `?project=courtyard-house` carries the project through as context. Answers live only in React state; nothing is sent, saved, written to storage or put in the URL.
- **Stage explorer**: keyboard-accessible tabs (arrow keys, Home and End), with four drawings from the same viewpoint. Each stage's new work is outlined in orange.

## Run it locally

Requires Node.js 20.9 or later (developed on Node 22).

```bash
npm ci
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

Production build:

```bash
npm run build
```

```bash
npm start
```

Type checking (`next typegen` generates the route and image types first):

```bash
npm run typecheck
```

Regenerate every illustration and drawing (see [ASSETS.md](./ASSETS.md)):

```bash
npm run art
```

## Structure

```
app/                     App Router pages (server components), global CSS, robots.ts
components/              SiteHeader, StageExplorer and EnquiryForm (client); AnnotatedFigure, SiteFooter (server)
content/
  stages.ts              The four construction stages: ids, copy, drawings and 3D model-layer names
  courtyard-house.ts     Project story, material decisions and gallery
  site.ts                Navigation, actions and services
  generated/             Label positions exported by the art pipeline
scripts/art/             Procedural model, vector renderer and 2D drawings used to make every image
art/                     SVG masters of the raster images
public/images, /stages   Optimised WebP images and stage SVG drawings
```

Content and stage data are kept apart from the components. `content/stages.ts` has no framework imports, so both the Next.js app and the Node art pipeline read it. The art pipeline refuses to draw any geometry whose layer is not declared there.

## Milestone two: the interactive 3D model

`content/stages.ts` is the contract for the 3D assembly. For each stage it gives:

- `id`, `number`, `title`, `summary`, `description` and `added`: the copy the explorer already shows.
- `modelLayers`: an ordered list of `{ id, label, material }`. The ids are the group names the 3D scene should use: `site-base`, `setting-out-grid`, `ground-slab`, `courtyard-void`, `blockwork-inner-leaf`, `steel-goalpost-frames`, `roof-timbers`, `brick-outer-leaf`, `glazing`, `zinc-roof`, `oak-joinery`, `timber-soffits`, `interior-finishes` and `courtyard-planting`.
- `materials`: a label and colour for each material key.
- `assemblyProgress`: 0 to 1, for scrubbing a GSAP timeline.
- `illustration`: the 2D drawing, which stays as the fallback when WebGL is unavailable.

`scripts/art/model.mjs` already describes the full geometry in metres, layer by layer (x east, y up, z south), and can be ported to React Three Fiber meshes.

## Accessibility and quality notes

- Orange (`#FF6534`) is only paired with charcoal text (5.4:1). It is never used for text on paper.
- Form fields have visible labels and inline errors linked with `aria-describedby`. On submit, focus moves to the first invalid field, and focus moves to the step heading when the step changes.
- Transitions are subtle and switched off under `prefers-reduced-motion`.
- Images are served through `next/image` as AVIF or WebP at responsive sizes, with intrinsic dimensions and blur placeholders, so layout does not shift.
- `noindex` is set in metadata, an `X-Robots-Tag` header and `robots.txt`.

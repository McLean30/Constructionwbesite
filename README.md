# Formwork Construction: portfolio demo

A portfolio demo for **Formwork Construction**, a fictional Glasgow residential builder (new builds, extensions and renovations). The site is built around **Courtyard House**, a fictional concept: two low buff-brick wings around a planted courtyard, with dark zinc roofs and oak joinery.

> Formwork is fictional. The site is kept out of search indexes, and the enquiry form never sends or stores anything.

## Milestone two: 3D assembly (`feature/courtyard-3d-assembly`)

Inside *See how the house comes together*, visitors can watch Courtyard House being built in 3D.

- **Same house, same view:** `scripts/art/export-model.mjs` exports the model behind the drawings (dimensions, orientation, courtyard layout, materials and the named layers in `content/stages.ts`) to `public/model/courtyard-house.json`, about 15 KB gzipped. The orthographic camera reproduces the plate's axonometric framing, so the 3D view opens exactly over the illustration.
- **Stages:** Foundations brings in the slab around the courtyard, Structure raises the blockwork and roof timbers, Envelope adds buff brick, glazing and zinc, and Finish adds oak soffits, joinery, interiors and courtyard planting. New parts glow safety orange, then settle into their material colours. The tab, caption and *Added at this stage* list always match the stage on screen.
- **Controls:** *Play the build*, *Pause* and *Replay*, the four stage tabs (arrow keys, Home and End) and *Reset view*. Choosing a stage during playback stops playback and goes straight to that stage. Drag sideways to turn the model gently. The mouse wheel and vertical touch swipes keep scrolling the page. With reduced motion, stages switch immediately.
- **Performance:** the hero and enquiry form need no 3D code. React Three Fiber, Three.js and GSAP sit in one lazy chunk that loads only when the plate comes within about 320 px of the viewport. The illustration stays until the first 3D frame has drawn. Rendering is on demand, so nothing draws while the model is idle. Phones and touch devices are capped at 1.5× resolution with no shadow maps. Every geometry, material, texture and tween is released on unmount.
- **Fallbacks:** if WebGL is unavailable, Data Saver is on, or the model fails to load or render, the illustrated plates stay, with playback and stage selection still working, and a short note explains why.

## Visual pass (`feature/courtyard-visual-pass`)

- **Homepage hero:** "Courtyard House" headline with the service line, *Discuss your project* and *Explore the house*, and the supplied concept visualisation at full content width. Desktop crops only the foreground, so both rooflines stay in. Phones get a separate square crop centred on the courtyard and the glazed living room, served with `<picture>`.
- **See how the house comes together:** directly after the hero. The axonometric is shown as a graphite construction plate with the four stages alongside it (below it on phones). The new parts of each stage are tinted and outlined in safety orange, with numbered markers that match the *Added at this stage* list.
- **Project page:** opens with the visualisation, then moves from the whole house to the zinc-and-oak junction (detail crop) to the section drawing that explains it. Each material decision sits beside a detail cropped from the visualisation.

## Milestone one

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

Production preview (the same build that was tested):

```bash
npm ci && npm run build && npm start
```

Then open <http://localhost:3000/#build-process>.

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

Re-export the 3D model after changing `scripts/art/model.mjs`:

```bash
npm run model
```

Regenerate the crops of the supplied concept visualisation:

```bash
npm run crops
```

## Structure

```
app/                     App Router pages (server components), global CSS, robots.ts
components/              SiteHeader, StageExplorer and EnquiryForm (client); AnnotatedFigure, HeroVisual, SiteFooter (server)
  assembly/              Lazy-loaded 3D assembly: Assembly3D (React Three Fiber scene) and houseModel (Three.js builder)
content/
  stages.ts              The four construction stages: ids, copy, drawings and 3D model-layer names
  courtyard-house.ts     Project story, material decisions and gallery
  site.ts                Navigation, actions and services
  generated/             Label positions exported by the art pipeline
scripts/art/             Procedural model, vector renderer and 2D drawings used to make every image
art/                     SVG masters of the raster images
public/images, /stages   WebP images and stage SVG drawings (paper and graphite plates)
public/model             3D assembly model exported from scripts/art/model.mjs
assets-src/              Original supplied concept visualisation (source for the crops)
```

Content and stage data are kept apart from the components. `content/stages.ts` has no framework imports, so both the Next.js app and the Node art pipeline read it. The art pipeline refuses to draw any geometry whose layer is not declared there.

## Stage data contract

`content/stages.ts` is the contract shared by the drawings and the 3D assembly. For each stage it gives:

- `id`, `number`, `title`, `summary`, `description` and `added`: the copy the explorer already shows.
- `modelLayers`: an ordered list of `{ id, label, material }`. The ids are the group names the 3D scene should use: `site-base`, `setting-out-grid`, `ground-slab`, `courtyard-void`, `blockwork-inner-leaf`, `steel-goalpost-frames`, `roof-timbers`, `brick-outer-leaf`, `glazing`, `zinc-roof`, `oak-joinery`, `timber-soffits`, `interior-finishes` and `courtyard-planting`.
- `materials`: a label and colour for each material key.
- `assemblyProgress`: 0 to 1, for scrubbing a GSAP timeline.
- `illustration` and `plate`: the 2D drawings (paper and graphite), which stay as the fallback when WebGL is unavailable.
- `markers`: drawing anchor ids in the same order as `added`.

`scripts/art/model.mjs` describes the full geometry in metres, layer by layer (x east, y up, z south). `npm run model` exports it for the 3D scene in `components/assembly/`.

## Accessibility and quality notes

- Orange (`#FF6534`) is only paired with charcoal text (5.4:1). It is never used for text on paper.
- Form fields have visible labels and inline errors linked with `aria-describedby`. On submit, focus moves to the first invalid field, and focus moves to the step heading when the step changes.
- Transitions are subtle and switched off under `prefers-reduced-motion`.
- Images are served through `next/image` as AVIF or WebP at responsive sizes, with intrinsic dimensions and blur placeholders, so layout does not shift.
- `noindex` is set in metadata, an `X-Robots-Tag` header and `robots.txt`.

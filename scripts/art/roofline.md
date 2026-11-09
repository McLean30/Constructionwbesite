# Hero roofline

The gold line on the homepage hero (`components/HeroVisual.tsx`) traces one visible roof edge of the concept visualisation, once, then fades.

Points are in pixels of `assets-src/courtyard-house-visualisation-original.webp` (1672 × 941):

| Point | Edge |
| --- | --- |
| (740, 411) → (1274, 394) | The link roof's dark fascia where it meets the lit oak soffit. It slopes slightly because of perspective. |
| (1274, 394) → (1378, 168) | Outer edge of the east wing's eaves fascia. |
| (1378, 168) → (1384, 160) | The step where the eaves meet the verge. |
| (1384, 160) → (1584, 0) | The gable verge against the sky. It leaves the frame at the top. |

These were measured on gridded, enlarged crops of the source and then re-checked by drawing the path over 2–3.5× enlargements.

- **Wide crop (≥ 700 px):** `object-fit: cover` with `object-position: 50% 0%`, and the frame is never taller than the image's natural ratio, so only the bottom is trimmed. The overlay uses the same viewBox with `preserveAspectRatio="xMidYMin slice"`, so it scales identically.
- **Phone crop (< 700 px):** the square crop (`courtyard-house-visualisation-phone.webp`) starts 540 px in and is shown uncropped at 940 / 941. The same points are shifted by −540. The verge is clipped where it leaves the right edge.

If the source image or either crop changes, re-measure the points before shipping.

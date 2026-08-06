# shannon-collins.com

Static Astro site (see [README.md](README.md) for the full picture).

## Ground rules

- **Content lives in `src/data/content.json`, not in the pages.** Edit that file to change
  copy or image lists. `scripts/scrape.mjs` generated it from Squarespace and **wipes
  `src/assets/images/` when re-run** — don't run it to "refresh" anything.
- **Images must be local.** The whole point of the rebuild is that nothing loads from
  Squarespace's CDN. Reference images through `image()` in `src/lib/content.ts` so Astro
  optimises them at build time.
- **The design is a deliberate copy of the old Squarespace theme.** Lato + Merriweather,
  1140px bordered canvas, 732px text column, no visible page headings (h1s are `.sr-only`).
  Don't "improve" the layout without being asked.

## Docs

Astro docs: https://docs.astro.build — [routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[images](https://docs.astro.build/en/guides/images/),
[styling](https://docs.astro.build/en/guides/styling/).

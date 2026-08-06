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
  71.25rem bordered canvas, 45.75rem text column, no visible page headings (h1s are
  `.sr-only`). Don't "improve" the layout without being asked.

## Styles

Sass under `src/styles/`, split into `abstracts/` `base/` `layout/` `components/` and
pulled together by `main.scss`. Two rules:

- **Mobile-first.** Base rules are the phone; every media query is a min-width
  `@include from('sm' | 'md' | 'lg')` from `abstracts/_breakpoints.scss`. Never add a
  max-width query.
- **rem for lengths.** px is reserved for hairline borders and focus outlines, which
  should not scale with the reader's font size.

## Accessibility

axe-core reports zero violations; keep it that way. Every page needs an `h1` (usually
`.sr-only`), heading levels must not skip, contrast must hit AA (`--ink-muted` is
`#6e6e6e` for exactly this reason), and new motion must honour `prefers-reduced-motion`.

## Internal links

`base` is set (staging on project Pages), so **every internal href must go through
`url()` from `src/lib/content.ts`** — Astro does not base-prefix plain href strings.
A hardcoded `/about` works locally and 404s in production.

## Docs

Astro docs: https://docs.astro.build — [routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[images](https://docs.astro.build/en/guides/images/),
[styling](https://docs.astro.build/en/guides/styling/).

# shannon-collins.com

Shannon Collins' portfolio site, rebuilt as a static [Astro](https://astro.build) site so
it can be hosted free on GitHub Pages instead of Squarespace.

All content and imagery was imported from the Squarespace site; every image is a local
file in `src/assets/images/`, so nothing depends on Squarespace once it's cancelled.

## Running it

```bash
npm install
npm run dev
```

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Dev server on http://localhost:4321                       |
| `npm run build`  | Static build into `dist/`                                 |
| `npm run preview`| Serves the built `dist/` on http://localhost:4322         |
| `npm run import` | Re-imports content + images from Squarespace (see below)  |

## How the content works

There's no CMS. Page copy and image lists live in [`src/data/content.json`](src/data/content.json),
which was generated once by [`scripts/scrape.mjs`](scripts/scrape.mjs) reading Squarespace's
`?format=json-pretty` API. Both the JSON and the downloaded images are committed.

To edit the site, edit `content.json` (and drop new files into `src/assets/images/`) — you
do **not** need to re-run the importer. `npm run import` only exists to re-pull from
Squarespace, and it wipes and rewrites `src/assets/images/`, so it stops being useful the
moment the Squarespace subscription lapses.

Adding a new illustration project:

1. Put the images in `src/assets/images/`.
2. Add an entry to `pages` in `content.json` (copy the shape of an existing project).
3. Add its slug to `projectOrder` — that array controls what the Illustration index shows
   and in what order.

## Styles

Sass, mobile-first, split by concern under [`src/styles/`](src/styles):

```
main.scss              entry point, imported once by Base.astro
abstracts/
  _breakpoints.scss    breakpoint map + from() mixin
  _tokens.scss         CSS custom properties (colours, fonts, spacing)
base/
  _fonts.scss          self-hosted Lato + Merriweather
  _reset.scss          element defaults
  _utilities.scss      .sr-only
layout/
  _canvas.scss         the bordered sheet everything sits on
  _masthead.scss       logo + nav
  _footer.scss         social icons
components/
  _banner.scss         full-width image + overlaid caption
  _prose.scss          body copy and headings
  _projects.scss       illustration index grid
```

Two rules worth keeping:

- **Mobile-first, always.** Base rules describe the phone; every media query is a
  min-width `@include from('sm' | 'md' | 'lg')`. There is deliberately no `until()`
  mixin — mixing both directions is what makes a stylesheet fight itself.
- **rem for lengths, px only for hairlines.** Sizes are rem so the layout scales with the
  reader's browser font size. 1px borders and focus outlines stay px so they don't blur.

The slideshow's styles live in `Slideshow.astro` rather than here, since nothing else
uses them.

## Routes

| Route                       | Was (Squarespace)                    |
| --------------------------- | ------------------------------------ |
| `/`                         | `/welcome`                           |
| `/illustration`             | `/portfolio`                         |
| `/illustration/<slug>`      | `/new-page`, `/personal`, etc.       |
| `/about`                    | `/about-1`                           |
| `/contact`                  | `/contact`                           |

Old URLs still resolve — `redirects` in [`astro.config.mjs`](astro.config.mjs) emits a
redirect stub for each one.

The **Photography** nav item points off-site to shannoncollins.com, exactly as it did
before.

## Contact

No form — the contact page just links to Shannon's email. Squarespace processed its form
server-side and a static site has nothing to replace that with, so the page points at their
inbox instead. The address comes from `social` in `content.json`.

## Deploying

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes on
every push to `main`. In the repo: **Settings → Pages → Source: GitHub Actions**.

Currently deployed to **https://peteschuster.github.io/shannon-collins** — a staging URL,
so the Squarespace site stays live and untouched while this one gets reviewed.

### Moving to www.shannon-collins.com

Two things have to happen, in this order:

1. **Confirm the domain survives cancelling Squarespace.** Squarespace bills domain
   registration separately from the site plan. If the domain is registered *through*
   Squarespace rather than just pointed at it, make sure the registration is transferred
   or kept before the plan lapses.
2. **Flip the config and DNS.** In [`astro.config.mjs`](astro.config.mjs) set
   `SITE = 'https://www.shannon-collins.com'` and `BASE = ''`, add `public/CNAME`
   containing `www.shannon-collins.com`, then point DNS at GitHub per
   [their custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

`SITE` and `BASE` are the only two knobs. Internal links go through `url()` in
`src/lib/content.ts` and the redirect map is built from `BASE`, so nothing else needs
editing — and `npm run build` will catch it if something was missed.

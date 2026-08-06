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

## Contact form

Squarespace processed the form server-side; GitHub Pages can't. Set
`PUBLIC_CONTACT_FORM_ENDPOINT` to a hosted form handler (a free
[Formspree](https://formspree.io) form is the least-effort option) and the contact page
renders the full form, posting there. Leave it unset and the page falls back to a plain
mailto link instead — no broken form either way.

- Locally: copy `.env.example` to `.env` and fill it in.
- On GitHub: **Settings → Secrets and variables → Actions → Variables**, add
  `PUBLIC_CONTACT_FORM_ENDPOINT`. The deploy workflow already passes it through.

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

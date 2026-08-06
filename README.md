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

The site is configured for the custom domain `www.shannon-collins.com`
([`public/CNAME`](public/CNAME) plus `site` in `astro.config.mjs`). DNS has to point at
GitHub before that works — see
[GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

To publish at `<username>.github.io/shannon-collins` instead: delete `public/CNAME`, and
in `astro.config.mjs` set `site: 'https://<username>.github.io'` and
`base: '/shannon-collins'`.

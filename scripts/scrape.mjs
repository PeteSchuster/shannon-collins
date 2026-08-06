/**
 * One-shot importer for the old Squarespace site.
 *
 * Squarespace exposes every page as JSON at `<url>?format=json-pretty`, which is
 * far more reliable than parsing the rendered DOM. This script walks the site,
 * pulls out the handful of blocks the site actually uses (text + slideshow
 * gallery), downloads every image to src/assets/images, and writes the result to
 * src/data/content.json.
 *
 * The output is committed, so this only needs re-running if the Squarespace site
 * changes before it gets cancelled.
 *
 *   node scripts/scrape.mjs
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const ORIGIN = 'https://www.shannon-collins.com';
const ROOT = path.resolve(import.meta.dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'src/assets/images');
const OUT = path.join(ROOT, 'src/data/content.json');

/** Old Squarespace path -> new route slug. */
const PAGES = [
  { source: '/welcome', slug: 'home' },
  { source: '/new-page', slug: 'the-things-we-do' },
  { source: '/say-hello-to-my-little-friends-1', slug: 'say-hello-to-my-little-friends' },
  { source: '/two-hundred-years-together', slug: 'two-hundred-years-together' },
  { source: '/personal', slug: 'personal' },
  { source: '/about-1', slug: 'about' },
  { source: '/contact', slug: 'contact' },
];

/** Projects listed on the Illustration index, in the order Squarespace shows them. */
const PROJECT_SLUGS = [
  'the-things-we-do',
  'say-hello-to-my-little-friends',
  'two-hundred-years-together',
  'personal',
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const downloads = new Map(); // cdn url (no query) -> local filename
const usedNames = new Set();

/** Longest edge we keep in the repo. Squarespace never served larger than this. */
const MAX_EDGE = 2500;

/**
 * Astro regenerates every displayed size at build time, so the checked-in copy only
 * needs to be the largest useful master. Cap it at MAX_EDGE, and flatten opaque PNGs
 * to JPEG — two of Shannon's PNG masters are 20MB apiece otherwise.
 */
async function normalize(buffer, ext) {
  const image = sharp(buffer, { limitInputPixels: false });
  const meta = await image.metadata();
  const opaquePng = ext === '.png' && !meta.hasAlpha;
  const oversized = Math.max(meta.width, meta.height) > MAX_EDGE;

  if (!opaquePng && !oversized) return { buffer, ext };

  let pipeline = image;
  if (oversized) pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' });
  if (opaquePng) return { buffer: await pipeline.jpeg({ quality: 92 }).toBuffer(), ext: '.jpg' };
  return { buffer: await pipeline.toBuffer(), ext };
}

/**
 * Download a Squarespace CDN image and return its filename under src/assets/images.
 * Squarespace serves the original when no `?format=` is given.
 */
async function grabImage(assetUrl) {
  const clean = assetUrl.split('?')[0].replace(/^\/\//, 'https://');
  if (downloads.has(clean)) return downloads.get(clean);

  const res = await fetch(clean);
  if (!res.ok) throw new Error(`${res.status} fetching ${clean}`);
  const original = Buffer.from(await res.arrayBuffer());
  const { buffer, ext } = await normalize(original, path.extname(clean).toLowerCase() || '.jpg');

  const base = slugify(decodeURIComponent(clean.split('/').pop()));
  let name = `${base}${ext}`;
  if (usedNames.has(name)) {
    // Same filename, different asset (Squarespace scopes by upload id, we don't).
    name = `${base}-${createHash('sha1').update(clean).digest('hex').slice(0, 6)}${ext}`;
  }
  usedNames.add(name);

  await writeFile(path.join(IMAGE_DIR, name), buffer);
  process.stdout.write(`  ↓ ${name} (${(buffer.length / 1024) | 0}kB)\n`);
  downloads.set(clean, name);
  return name;
}

async function fetchPage(sourcePath) {
  const res = await fetch(`${ORIGIN}${sourcePath}?format=json-pretty`);
  if (!res.ok) throw new Error(`${res.status} fetching ${sourcePath}`);
  return res.json();
}

/** Squarespace `mainImage` -> our banner shape. */
async function toImage(mainImage, fallbackAlt = '') {
  if (!mainImage) return null;
  return { src: await grabImage(mainImage.assetUrl), alt: mainImage.title || fallbackAlt };
}

/**
 * Strip Squarespace's wrapper markup off a text block, keeping the inline HTML
 * (links, emphasis) that the copy actually relies on.
 */
function cleanHtml($, block) {
  const $content = $(block).find('.sqs-html-content');
  $content.find('[style]').removeAttr('style');
  $content.find('[class]').removeAttr('class');
  $content.find('a[target]').each((_, a) => {
    // External links keep target=_blank but need rel for safety.
    if ($(a).attr('target') === '_blank') $(a).attr('rel', 'noopener noreferrer');
  });
  return $content
    .html()
    .replace(/ /g, ' ')
    .replace(/\s*\n\s*/g, '')
    .trim();
}

async function parseBlocks(mainContent) {
  const blocks = [];
  if (!mainContent) return blocks;
  const $ = cheerio.load(mainContent);

  for (const el of $('.sqs-block').toArray()) {
    const kind = $(el).attr('data-sqsp-block');

    if (kind === 'text') {
      const html = cleanHtml($, el);
      if (html && html !== '<p> </p>') blocks.push({ type: 'text', html });
      continue;
    }

    if (kind === 'gallery') {
      const images = [];
      for (const img of $(el).find('img.thumb-image').toArray()) {
        const src = $(img).attr('data-src') || $(img).attr('src');
        images.push({ src: await grabImage(src), alt: $(img).attr('alt') || '' });
      }
      if (images.length) blocks.push({ type: 'gallery', images });
      continue;
    }

    if (kind === 'form') {
      // Rebuilt by hand in src/pages/contact.astro — Squarespace's form handler
      // goes away with the subscription.
      blocks.push({ type: 'form' });
    }
  }
  return blocks;
}

async function main() {
  await rm(IMAGE_DIR, { recursive: true, force: true });
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(path.dirname(OUT), { recursive: true });

  const site = { pages: {}, projectOrder: PROJECT_SLUGS, logo: null, social: [] };

  for (const { source, slug } of PAGES) {
    process.stdout.write(`${source} -> /${slug === 'home' ? '' : slug}\n`);
    const json = await fetchPage(source);
    const c = json.collection || {};

    if (!site.logo) {
      site.logo = await grabImage(json.website.logoImageUrl);
      site.social = (json.website.socialAccounts || []).map((s) => ({
        service: s.serviceName,
        url: s.profileUrl,
      }));
    }

    site.pages[slug] = {
      title: c.title || '',
      // The Illustration index uses each project's description as its caption.
      description: (c.description || '').replace(/<[^>]*>/g, '').trim(),
      banner: await toImage(c.mainImage, c.title),
      blocks: await parseBlocks(json.mainContent),
    };
  }

  await writeFile(OUT, JSON.stringify(site, null, 2) + '\n');
  process.stdout.write(`\nWrote ${path.relative(ROOT, OUT)} (${downloads.size} images)\n`);
}

await main();

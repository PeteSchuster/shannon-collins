import content from '../data/content.json';

export type ImageRef = { src: string; alt: string };

export type Block =
  | { type: 'text'; html: string }
  | { type: 'gallery'; images: ImageRef[] }
  | { type: 'form' };

export type Page = {
  title: string;
  description: string;
  banner: ImageRef | null;
  blocks: Block[];
};

const pages = content.pages as unknown as Record<string, Page>;

/**
 * Prefixes an internal path with the configured `base`. Astro does not do this for
 * plain href strings, so every internal link must go through here — otherwise the
 * site breaks the moment it is served from a subdirectory (or stops working when it
 * moves back off one).
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const rest = path.replace(/^\//, '');
  return rest ? `${base}/${rest}` : base || '/';
}

export const site = {
  title: 'Shannon Collins',
  tagline: 'Illustrator and photographer based in the Philadelphia area.',
  logo: content.logo as string,
  social: content.social as { service: string; url: string }[],
};

export function getPage(slug: string): Page {
  const page = pages[slug];
  if (!page) throw new Error(`No page "${slug}" in content.json — re-run scripts/scrape.mjs?`);
  return page;
}

/** Illustration projects, in the order the old index listed them. */
export const projects = (content.projectOrder as string[]).map((slug) => ({
  slug,
  href: url(`/illustration/${slug}`),
  ...getPage(slug),
}));

/**
 * Astro needs a static, build-time reference to every image it optimises, so the
 * whole folder is globbed once and content.json's filenames are looked up here.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,png,gif,webp,avif}',
  { eager: true },
);

const byName = new Map(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

export function image(name: string): ImageMetadata {
  const found = byName.get(name);
  if (!found) throw new Error(`Missing src/assets/images/${name} — re-run scripts/scrape.mjs?`);
  return found;
}

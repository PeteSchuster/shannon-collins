// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

/*
 * Staging on project Pages while the Squarespace site stays live. To move to the real
 * domain: set SITE to 'https://www.shannon-collins.com', set BASE to '', restore
 * public/CNAME, and point DNS at GitHub. Nothing else needs touching — internal links
 * go through url() in src/lib/content.ts and the redirect map below is built from BASE.
 */
const SITE = 'https://peteschuster.github.io';
const BASE = '/shannon-collins';

/**
 * Every URL the Squarespace site published, pointed at its replacement. Astro emits
 * meta-refresh stubs for these, which is all GitHub Pages can do.
 *
 * Astro base-prefixes the *source* routes but not the destinations, so they're joined
 * here by hand.
 */
const redirects = Object.fromEntries(
  Object.entries({
    '/welcome': '/',
    '/portfolio': '/illustration',
    '/new-page': '/illustration/the-things-we-do',
    '/say-hello-to-my-little-friends-1': '/illustration/say-hello-to-my-little-friends',
    '/two-hundred-years-together': '/illustration/two-hundred-years-together',
    '/personal': '/illustration/personal',
    '/about-1': '/about',
    // Orphaned 2017 gallery, no longer linked from anywhere.
    '/photography': '/illustration',
  }).map(([from, to]) => [from, to === '/' ? BASE || '/' : `${BASE}${to}`]),
);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',

  build: {
    // GitHub Pages serves /about/index.html for /about, so directory-style output
    // keeps the URLs extension-free without any server config.
    format: 'directory',
  },

  image: {
    // Illustrations are the whole point of the site; don't let the encoder soften them.
    responsiveStyles: true,
    layout: 'constrained',
  },

  redirects,

  integrations: [sitemap()],
});

// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.shannon-collins.com',
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

  // Every URL the Squarespace site published, pointed at its replacement. Astro
  // emits meta-refresh stubs for these, which is all GitHub Pages can do.
  redirects: {
    '/welcome': '/',
    '/portfolio': '/illustration',
    '/new-page': '/illustration/the-things-we-do',
    '/say-hello-to-my-little-friends-1': '/illustration/say-hello-to-my-little-friends',
    '/two-hundred-years-together': '/illustration/two-hundred-years-together',
    '/personal': '/illustration/personal',
    '/about-1': '/about',
    // Orphaned 2017 gallery, no longer linked from anywhere.
    '/photography': '/illustration',
  },

  integrations: [sitemap()],
});
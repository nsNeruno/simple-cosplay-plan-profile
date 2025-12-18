// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

/**
 * Rsbuild Configuration for Image Gallery PWA
 *
 * This configuration sets up:
 * - React plugin for JSX support
 * - HTML template with PWA meta tags and manifest link
 * - Public directory for static assets (service worker, manifest, icons)
 * - PostCSS with Tailwind CSS support
 */
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Image Gallery PWA',
    meta: {
      description: 'Offline-first image gallery for organizing photos',
      viewport: 'width=device-width, initial-scale=1.0',
      'theme-color': '#2563eb',
    },
    tags: [
      { tag: 'link', attrs: { rel: 'manifest', href: '/manifest.json' } },
      { tag: 'link', attrs: { rel: 'icon', href: '/favicon.png' } },
      {
        tag: 'meta',
        attrs: {
          name: 'apple-mobile-web-app-capable',
          content: 'yes'
        }
      },
      {
        tag: 'meta',
        attrs: {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'default'
        }
      }
    ]
  },
  server: {
    // Copy public folder assets to output
    publicDir: {
      name: 'public',
      copyOnBuild: true
    }
  }
});

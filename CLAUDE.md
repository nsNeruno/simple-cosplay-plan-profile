# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Image Gallery PWA - An offline-first Progressive Web App for organizing images into groups. Built with React 19, TypeScript, Tailwind CSS 3, and IndexedDB for client-side storage.

## Commands

```bash
npm run dev       # Start dev server (opens http://localhost:3000)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
npm run deploy    # Deploy to GitHub Pages (runs build first)
```

## Architecture

### State Management
Uses React Context API (`src/contexts/ImageGalleryContext.tsx`) as single source of truth:
- `useImageGallery()` - Full context access
- `useGroups()` - Group-only state and actions
- `useImages()` - Image-only state and actions

### Data Layer
IndexedDB service (`src/services/db.ts`) with two object stores:
- **groups**: id, name, createdAt, updatedAt (indexed by name)
- **images**: id, groupId, name, blob, createdAt (indexed by groupId)

Deleting a group cascades to delete all its images.

### Component Structure
- `App.tsx` - Root component, wraps in ImageGalleryProvider
- `GroupList.tsx` - Group CRUD, expandable section, preview modal
- `ImageGallery.tsx` - Image grid, multiple upload methods (file, drag-drop, paste, URL)
- `PreviewModal.tsx` - Modal overlay for group image preview

### Styling
Material Design 3 dark theme via Tailwind CSS with custom classes in `src/index.css`:
- Buttons: `btn-filled`, `btn-outlined`, `btn-text`, `btn-danger`, `btn-success`
- Cards: `card-surface`, `card-surface-hover`
- Inputs: `input-base`
- Typography: `display-*`, `headline-*`, `title-*`, `body-*`, `label-*`

Color tokens: `--dark-bg` (#1e1e1e), `--dark-surface` (#2d2d2d), `--dark-hover` (#3a3a3a), `--dark-border` (#404040)

### PWA
- Service Worker: `public/sw.js` (caches app shell)
- Manifest: `public/manifest.json`
- Works offline after first load

## Key Patterns

- All async DB operations return Promises with typed errors
- Components use specific context hooks (not full context) for selective re-rendering
- Error handling uses type guards (`error instanceof Error`) with user-friendly alerts
- File uploads support: browse, drag-drop, clipboard paste, URL download

## External Documentation

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt

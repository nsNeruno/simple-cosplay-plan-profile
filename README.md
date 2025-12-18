# Image Gallery PWA

An offline-first Progressive Web App (PWA) for organizing images into groups. Built with React, TypeScript, Tailwind CSS, and IndexedDB.

## Features

### Core Functionality
- **Create/Remove Image Groups**: Organize your images into custom groups
- **Multiple Image Upload Methods**:
  - Browse and select files from your computer
  - Drag and drop images directly into the gallery
  - Paste images from clipboard (Ctrl+V / Cmd+V)
  - Download images from internet URLs
- **Offline-First**: All data stored locally in IndexedDB, works without internet
- **PWA Support**: Installable as a native app on mobile and desktop

### Technical Features
- **TypeScript**: Full type safety and enhanced developer experience
- **IndexedDB Storage**: Persistent local storage for groups and images
- **Service Worker**: Enables offline functionality and caching
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Tailwind CSS**: Modern, utility-first styling

## Project Structure

```
├── public/
│   ├── favicon.png           # App icon
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker for offline support
├── src/
│   ├── components/
│   │   ├── GroupList.tsx      # Group management sidebar
│   │   └── ImageGallery.tsx   # Image display and upload component
│   ├── services/
│   │   └── db.ts              # IndexedDB service layer with types
│   ├── App.tsx                # Main application component
│   ├── index.tsx              # Entry point with SW registration
│   └── index.css              # Tailwind imports
├── rsbuild.config.js          # Build configuration
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage Guide

### Creating a Group
1. Click the "+ New Group" button in the sidebar
2. Enter a name for your group
3. Click "Create"

### Adding Images
Once a group is selected, you can add images using any of these methods:

**Method 1: Browse Files**
- Click the "Browse Files" button
- Select one or more images from your computer

**Method 2: Drag and Drop**
- Drag image files from your computer
- Drop them anywhere in the gallery area

**Method 3: Paste from Clipboard**
- Copy an image (from a website, screenshot tool, etc.)
- Press Ctrl+V (or Cmd+V on Mac) while viewing the gallery

**Method 4: Download from URL**
- Enter an image URL in the input field
- Click "Download"

### Deleting Content
- **Delete Image**: Hover over an image and click the "Delete" button
- **Delete Group**: Click the "Delete" button next to a group name (this also deletes all images in that group)

## Technology Stack

- **React 19**: UI framework
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Tailwind CSS 4**: Styling
- **IndexedDB**: Local storage
- **Service Worker**: Offline support and caching
- **Rsbuild**: Build tool
- **PWA**: Progressive Web App capabilities

## Database Schema

### IndexedDB Structure

**Database Name**: `ImageGalleryDB`

**Object Stores**:

1. `groups`
   - `id` (primary key, auto-increment)
   - `name` (string)
   - `createdAt` (ISO date string)
   - `updatedAt` (ISO date string)

2. `images`
   - `id` (primary key, auto-increment)
   - `groupId` (foreign key to groups)
   - `name` (string)
   - `blob` (Blob - actual image data)
   - `createdAt` (ISO date string)
   - Index: `groupId` (for efficient querying)

## PWA Features

### Offline Support
- Service worker caches app shell (HTML, CSS, JS)
- IndexedDB stores all images and groups locally
- Works completely offline after first load

### Installation
Users can install the app:
- **Desktop**: Click the install button in the browser's address bar
- **Mobile**: Use "Add to Home Screen" option in browser menu

### Manifest
Configured in `public/manifest.json` with:
- App name and description
- Icons
- Display mode (standalone)
- Theme colors

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)

Requires browser support for:
- IndexedDB
- Service Workers
- ES6+

## Future Enhancements

Potential features for future development:
- Image editing capabilities
- Search and filter functionality
- Export/import groups
- Cloud sync option
- Image compression
- Bulk operations

## License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

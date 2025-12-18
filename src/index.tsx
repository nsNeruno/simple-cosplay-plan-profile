import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Application Entry Point
 *
 * This file:
 * 1. Imports necessary React libraries and styles
 * 2. Renders the root App component
 * 3. Registers the service worker for PWA functionality
 */

// Get the root element from the HTML
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

/**
 * Register Service Worker for PWA functionality
 *
 * The service worker enables:
 * - Offline capabilities by caching app shell
 * - App installation on desktop and mobile devices
 * - Faster subsequent loads through caching
 *
 * Only registers in production builds and supported browsers.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.PROD ? '/simple-cosplay-plan-profile/sw.js' : '/sw.js';
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

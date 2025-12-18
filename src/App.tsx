import GroupList from './components/GroupList';
import ImageGallery from './components/ImageGallery';
import { ImageGalleryProvider } from './contexts/ImageGalleryContext';

/**
 * Main App Component
 *
 * This is the root component for the offline-first image gallery PWA.
 * It provides the ImageGalleryContext to all child components and renders
 * the main application layout.
 *
 * Architecture:
 * - Uses Context API for centralized state management
 * - All database operations are handled through the context
 * - Components consume data via custom hooks
 * - Clean separation of concerns between UI and data layers
 *
 * Features:
 * - Create and delete image groups
 * - Select groups to view their images
 * - Add images via multiple methods (file select, drag/drop, paste, URL)
 * - Rename and delete groups and images
 * - All data persisted in IndexedDB for offline access
 *
 * @returns The rendered application
 */
const App: React.FC = () => {
  return (
    <ImageGalleryProvider>
      <div className="min-h-screen bg-dark-bg flex flex-col">
        {/* Header - Material Design App Bar */}
        <header className="bg-dark-surface border-b border-dark-border shadow-lg">
          <div className="container-centered py-4">
            <h1 className="text-headline-large">Image Gallery</h1>
            <p className="text-body-medium mt-1">
              Offline-first PWA • TypeScript • IndexedDB • React Context
            </p>
          </div>
        </header>

        {/* Main Content - Centered with max width */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-centered section-spacing">
            {/* Group Management Section */}
            <GroupList />

            {/* Image Gallery Section */}
            <ImageGallery />
          </div>
        </main>
      </div>
    </ImageGalleryProvider>
  );
};

export default App;

import { useState, useEffect, useRef } from 'react';
import type { StoredImage } from '../services/db';
import { useImages } from '../contexts/ImageGalleryContext';

/**
 * Props for the ImageCard component
 */
interface ImageCardProps {
  /** Image object from IndexedDB */
  image: StoredImage;
  /** Callback to rename the image */
  onRename: (imageId: number, newName: string) => Promise<void>;
  /** Callback to delete the image */
  onDelete: (imageId: number, imageName: string) => Promise<void>;
}

/**
 * ImageGallery Component
 *
 * Displays images for a selected group with Material Design dark theme.
 * Provides multiple ways to add images with responsive grid layout.
 *
 * This component now uses the useImages hook to access state and actions
 * from the ImageGallery context, providing clean separation of concerns
 * between UI and data layers.
 *
 * Features:
 * - Multiple image upload methods (browse, drag/drop, paste, URL)
 * - Responsive grid layout with proper column distribution
 * - Material Design typography and elevation
 * - Visual drag-and-drop feedback
 * - Image preview with rename and delete functionality
 *
 * @returns The rendered image gallery
 */
const ImageGallery: React.FC = () => {
  /** Access image-related state and actions from context */
  const {
    images,
    selectedGroupId: groupId,
    addImageToGroup,
    renameExistingImage,
    deleteExistingImage,
  } = useImages();
  /** Whether files are currently being dragged over the drop zone */
  const [isDragging, setIsDragging] = useState<boolean>(false);
  /** Input value for image URL download */
  const [urlInput, setUrlInput] = useState<string>('');
  /** Whether an image is currently being downloaded from URL */
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  /** Reference to the hidden file input element */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Sets up clipboard paste event listener
   */
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent): void => {
      if (!groupId) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleImageFile(blob, `pasted-${Date.now()}.png`);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [groupId]);

  /**
   * Processes an image file and adds it to the current group
   */
  const handleImageFile = async (file: File | Blob, customName?: string): Promise<void> => {
    if (!groupId) {
      alert('Please select a group first');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      const name = customName || (file instanceof File ? file.name : 'image.jpg');
      await addImageToGroup(groupId, name, file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to add image: ' + errorMessage);
    }
  };

  /**
   * Handles file selection from file input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      handleImageFile(file);
    });

    e.target.value = '';
  };

  /**
   * Drag and drop event handlers
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      handleImageFile(file);
    });
  };

  /**
   * Downloads an image from a URL
   */
  const handleDownloadFromUrl = async (): Promise<void> => {
    if (!urlInput.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (!groupId) {
      alert('Please select a group first');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(urlInput);

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();

      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      const urlParts = urlInput.split('/');
      const filename = urlParts[urlParts.length - 1] || `downloaded-${Date.now()}.jpg`;

      await handleImageFile(blob, filename);
      setUrlInput('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to download image: ' + errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handles image deletion with confirmation
   */
  const handleDeleteImage = async (imageId: number, imageName: string): Promise<void> => {
    if (window.confirm(`Delete "${imageName}"?`)) {
      try {
        await deleteExistingImage(imageId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('Failed to delete image: ' + errorMessage);
      }
    }
  };

  // Show message when no group is selected
  if (!groupId) {
    return (
      <section className="text-center card-spacious">
        <svg
          className="w-20 h-20 mx-auto mb-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-headline-small mb-2">No group selected</h3>
        <p className="text-body-medium">
          Select or create a group above to start adding images
        </p>
      </section>
    );
  }

  return (
    <section>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-display-small">Images</h2>
        <p className="text-body-medium mt-1">
          {images.length} {images.length === 1 ? 'image' : 'images'} in this group
        </p>
      </div>

      {/* Upload Controls */}
      <div className="card-standard mb-6 space-y-4">
        <h3 className="text-title-large mb-4">Add Images</h3>

        {/* File Browse Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-filled w-full"
        >
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Browse Files
        </button>

        {/* URL Download */}
        <div className="flex gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleDownloadFromUrl()}
            placeholder="Enter image URL"
            className="input-base flex-1"
            disabled={isDownloading}
          />
          <button
            onClick={handleDownloadFromUrl}
            disabled={isDownloading}
            className="btn-success"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>

        {/* Help Text */}
        <div className="flex items-start gap-2 card-compact bg-dark-hover">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-body-medium">
            You can also <strong>drag & drop</strong> images anywhere below or{' '}
            <strong>paste from clipboard</strong> (Ctrl+V / Cmd+V)
          </p>
        </div>
      </div>

      {/* Drop Zone / Image Grid */}
      <div
        className={`
          min-h-[400px] rounded-lg border-2 border-dashed transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-600/10'
            : 'border-dark-border bg-dark-surface/50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <svg
              className="w-16 h-16 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            <p className="text-headline-small text-blue-400">Drop images here</p>
          </div>
        ) : images.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-headline-small mb-2">No images yet</h3>
            <p className="text-body-medium max-w-md">
              Add images using the buttons above, drag & drop, paste from clipboard, or download from a URL
            </p>
          </div>
        ) : (
          <div className="p-6 grid-images">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRename={renameExistingImage}
                onDelete={handleDeleteImage}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * ImageCard Component
 *
 * Displays a single image in a card layout with Material Design styling.
 * Features hover-activated rename and delete buttons with proper image scaling.
 *
 * @param props - Component props
 * @returns The rendered image card
 */
const ImageCard: React.FC<ImageCardProps> = ({ image, onRename, onDelete }) => {
  /** Object URL created from the image blob for display */
  const [imageUrl, setImageUrl] = useState<string>('');
  /** Whether the card is in rename mode */
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  /** Input value for the new name */
  const [newName, setNewName] = useState<string>(image.name);

  /**
   * Creates an object URL from the blob and cleans up on unmount
   */
  useEffect(() => {
    const url = URL.createObjectURL(image.blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image.blob]);

  /**
   * Handles the rename operation
   */
  const handleRename = async (): Promise<void> => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert('Please enter a filename');
      return;
    }

    if (trimmedName === image.name) {
      // No change, just exit rename mode
      setIsRenaming(false);
      return;
    }

    try {
      await onRename(image.id, trimmedName);
      setIsRenaming(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to rename image: ' + errorMessage);
      setNewName(image.name); // Reset to original name
    }
  };

  /**
   * Cancels the rename operation
   */
  const handleCancelRename = (): void => {
    setNewName(image.name);
    setIsRenaming(false);
  };

  return (
    <div className="card-surface overflow-hidden group/image relative">
      {/* Image Container - Square aspect ratio */}
      <div className="aspect-square overflow-hidden bg-black/20">
        <img
          src={imageUrl}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover/image:scale-105"
        />
      </div>

      {/* Image Info */}
      <div className="p-3">
        {isRenaming ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') handleCancelRename();
              }}
              className="input-base text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleRename}
                className="btn-success flex-1 px-2 py-1 text-xs"
              >
                Save
              </button>
              <button
                onClick={handleCancelRename}
                className="btn-outlined flex-1 px-2 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-body-medium truncate" title={image.name}>
              {image.name}
            </p>
            <p className="text-body-medium text-gray-500 text-xs mt-1">
              {new Date(image.createdAt).toLocaleDateString()}
            </p>
          </>
        )}
      </div>

      {/* Action Buttons Overlay (shows on hover) */}
      {!isRenaming && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRenaming(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Rename
          </button>
          <button
            onClick={() => onDelete(image.id, image.name)}
            className="btn-danger"
          >
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

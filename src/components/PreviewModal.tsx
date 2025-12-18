import { useEffect, useState, useRef } from 'react';
import type { StoredImage } from '../services/db';

/**
 * Props for PreviewModal component
 */
interface PreviewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Title of the group */
  groupName: string;
  /** Array of images to preview */
  images: StoredImage[];
}

/**
 * PreviewModal Component
 *
 * Displays a modal with group images in a diagonal split layout.
 * Images are arranged in rows of maximum 5 images, with each row
 * using alternating diagonal split patterns.
 *
 * Features:
 * - Full-screen modal overlay
 * - Diagonal split layout for image rows
 * - Max 5 images per row
 * - Alternating diagonal directions
 * - Click outside to close
 * - ESC key to close
 *
 * @param props - Component props
 * @returns The rendered preview modal
 */
const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  groupName,
  images,
}) => {
  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Split images into rows of maximum 5 images each
   */
  const imageRows: StoredImage[][] = [];
  for (let i = 0; i < images.length; i += 5) {
    imageRows.push(images.slice(i, i + 5));
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-dark-surface rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-headline-large">{groupName}</h2>
            <p className="text-body-medium mt-1">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-text p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close preview"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
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
              <h3 className="text-headline-small mb-2">No images in this group</h3>
              <p className="text-body-medium">
                Add some images to see them in preview
              </p>
            </div>
          ) : (
            imageRows.map((row, rowIndex) => (
              <DiagonalSplitRow
                key={rowIndex}
                images={row}
                isReversed={rowIndex % 2 === 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Props for DiagonalSplitRow component
 */
interface DiagonalSplitRowProps {
  /** Array of images for this row (max 5) */
  images: StoredImage[];
  /** Whether to reverse the diagonal direction */
  isReversed: boolean;
}

/**
 * DiagonalSplitRow Component
 *
 * Renders a row of images with diagonal split layout.
 * Images are layered with z-index and offset horizontally.
 * Each image (except the last) has a right-angled triangle crop.
 *
 * @param props - Component props
 * @returns The rendered diagonal split row
 */
const DiagonalSplitRow: React.FC<DiagonalSplitRowProps> = ({
  images,
  isReversed,
}) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    // Single image - no split
    return (
      <div className="w-full">
        <SingleImage image={images[0]} />
      </div>
    );
  }

  // Calculate dimensions based on image count
  // More images = narrower width and steeper angle
  // Fewer images = wider width and gentler angle
  const imageCount = images.length;

  // Base width scales with image count to fill container
  // 2 images: ~50% each, 3 images: ~40% each, 4 images: ~30% each, 5 images: ~25% each
  const baseWidthPercentage = imageCount === 2 ? 55 :
                               imageCount === 3 ? 42 :
                               imageCount === 4 ? 32 : 25;

  const baseWidth = baseWidthPercentage;

  // Calculate offset to distribute remaining space evenly
  const totalBaseWidth = baseWidth * imageCount;
  const remainingSpace = 100 - totalBaseWidth;
  const offsetPerImage = remainingSpace / (imageCount - 1);

  // Triangle offset (diagonal angle) scales with image count
  // Fewer images = gentler angle (smaller offset), More images = steeper angle (larger offset)
  // 2 images: 15% (gentle), 3 images: 20%, 4 images: 23%, 5 images: 25% (steeper)
  const triangleOffsetPercent = imageCount === 2 ? 15 :
                                 imageCount === 3 ? 20 :
                                 imageCount === 4 ? 23 : 25;

  // Multiple images - layered with offsets and triangle crops
  return (
    <div className="relative w-full" style={{ height: '300px' }}>
      {images.map((image, index) => (
        <ImageWithSplit
          key={image.id}
          image={image}
          index={index}
          totalImages={images.length}
          isReversed={isReversed}
          baseWidth={baseWidth}
          offsetPerImage={offsetPerImage}
          triangleOffsetPercent={triangleOffsetPercent}
        />
      ))}
    </div>
  );
};

/**
 * Props for SingleImage component
 */
interface SingleImageProps {
  /** Image to display */
  image: StoredImage;
}

/**
 * SingleImage Component
 *
 * Renders a single image without diagonal split.
 *
 * @param props - Component props
 * @returns The rendered single image
 */
const SingleImage: React.FC<SingleImageProps> = ({ image }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(image.blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image.blob]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-black/20 border border-dark-border" style={{ height: '300px' }}>
      <img
        src={imageUrl}
        alt={image.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-body-medium text-white truncate" title={image.name}>
          {image.name}
        </p>
      </div>
    </div>
  );
};

/**
 * Props for ImageWithSplit component
 */
interface ImageWithSplitProps {
  /** Image to display */
  image: StoredImage;
  /** Index of this image in the row */
  index: number;
  /** Total number of images in the row */
  totalImages: number;
  /** Whether to reverse the diagonal direction */
  isReversed: boolean;
  /** Base width percentage for each image */
  baseWidth: number;
  /** Horizontal offset percentage between images */
  offsetPerImage: number;
  /** Triangle offset percentage (diagonal angle) */
  triangleOffsetPercent: number;
}

/**
 * ImageWithSplit Component
 *
 * Renders an image with layering and optional triangle crop.
 * Images are stacked with z-index (first image has highest z-index).
 * Each image except the last has a right-angled triangle crop.
 *
 * The triangle crop angle adjusts based on image count:
 * - 2 images: 15% offset (gentler angle ~71°)
 * - 3 images: 20% offset (medium angle ~68°)
 * - 4 images: 23% offset (steeper angle ~67°)
 * - 5 images: 25% offset (steepest angle ~66°)
 * - 90° corner always at top-right or bottom-right
 *
 * @param props - Component props
 * @returns The rendered image with diagonal clip
 */
const ImageWithSplit: React.FC<ImageWithSplitProps> = ({
  image,
  index,
  totalImages,
  isReversed,
  baseWidth,
  offsetPerImage,
  triangleOffsetPercent,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [panPosition, setPanPosition] = useState({ x: 50, y: 50 }); // Percentage (50 = center)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(image.blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image.blob]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Guard against zero or invalid dimensions
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      // Calculate pixel delta from drag start
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Convert pixel delta to percentage delta
      // Negative because dragging right should pan left (move focus right)
      const percentDeltaX = -(deltaX / rect.width) * 100;
      const percentDeltaY = -(deltaY / rect.height) * 100;

      // Update pan position using functional setState to avoid closure issues
      setPanPosition((prev) => ({
        x: Math.max(0, Math.min(100, prev.x + percentDeltaX)),
        y: Math.max(0, Math.min(100, prev.y + percentDeltaY)),
      }));

      // Update drag start for next move
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard against NaN or invalid deltaY
    if (typeof e.deltaY !== 'number' || isNaN(e.deltaY)) {
      return;
    }

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle double click to reset
  const handleDoubleClick = () => {
    setPanPosition({ x: 50, y: 50 });
    setScale(1);
  };

  // Add and remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Calculate position and z-index
  // First image has highest z-index, positioned at left
  // Each subsequent image is offset to the right with lower z-index
  const zIndex = totalImages - index;

  // Position = (base width × index) + (offset × index)
  // This accounts for both the width of previous images AND the gaps between them
  const leftPosition = (baseWidth * index) + (offsetPerImage * index);
  const isLastImage = index === totalImages - 1;

  // Create clip path - right-angled triangle crop at corner
  // The diagonal line extends from corner to opposite edge
  // The angle adjusts based on image count (passed via triangleOffsetPercent)
  let clipPath: string | undefined;
  if (!isLastImage) {
    if (isReversed) {
      // Reversed: diagonal from bottom-right to top-left direction
      // The diagonal line goes from (100%, 100%) to (100% - offset, 0%)
      clipPath = `polygon(
        0 0,
        calc(100% - ${triangleOffsetPercent}%) 0,
        100% 100%,
        0 100%
      )`;
    } else {
      // Normal: diagonal from top-right to bottom-left direction
      // The diagonal line goes from (100%, 0%) to (100% - offset, 100%)
      clipPath = `polygon(
        0 0,
        100% 0,
        calc(100% - ${triangleOffsetPercent}%) 100%,
        0 100%
      )`;
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-0 h-full group/preview-image"
      style={{
        left: `${leftPosition}%`,
        width: `${baseWidth}%`,
        zIndex,
        clipPath,
      }}
      onWheel={handleWheel}
    >
      <img
        src={imageUrl}
        alt={image.name}
        className="object-cover"
        style={{
          width: `${scale * 100}%`,
          height: `${scale * 100}%`,
          objectPosition: `${panPosition.x}% ${panPosition.y}%`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        draggable={false}
      />

      {/* Image name tooltip - shows on hover, highest z-index in row */}
      <div
        className="absolute bottom-0 left-0 right-0 opacity-0 group-hover/preview-image:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          zIndex: 9999
        }}
      >
        <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 py-3 pb-4">
          <p
            className="text-sm text-white text-center truncate"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)'
            }}
            title={image.name}
          >
            {image.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;

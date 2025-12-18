import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  getAllGroups,
  createGroup,
  renameGroup,
  deleteGroup,
  getImagesByGroup,
  addImage,
  renameImage,
  deleteImage,
  type ImageGroup,
  type StoredImage
} from '../services/db';

/**
 * Shape of the ImageGallery context state
 */
interface ImageGalleryContextState {
  /** All available image groups */
  groups: ImageGroup[];
  /** Currently selected group ID */
  selectedGroupId: number | null;
  /** Images in the currently selected group */
  images: StoredImage[];
  /** Loading state for groups */
  isLoadingGroups: boolean;
  /** Loading state for images */
  isLoadingImages: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Shape of the ImageGallery context actions
 */
interface ImageGalleryContextActions {
  /** Select a group by ID */
  selectGroup: (groupId: number | null) => void;
  /** Create a new group */
  createNewGroup: (name: string) => Promise<void>;
  /** Rename an existing group */
  renameExistingGroup: (groupId: number, newName: string) => Promise<void>;
  /** Delete a group */
  deleteExistingGroup: (groupId: number) => Promise<void>;
  /** Add an image to a group */
  addImageToGroup: (groupId: number, name: string, blob: Blob) => Promise<void>;
  /** Rename an existing image */
  renameExistingImage: (imageId: number, newName: string) => Promise<void>;
  /** Delete an image */
  deleteExistingImage: (imageId: number) => Promise<void>;
}

/**
 * Combined context type
 */
type ImageGalleryContextType = ImageGalleryContextState & ImageGalleryContextActions;

/**
 * Context for ImageGallery state and actions
 */
const ImageGalleryContext = createContext<ImageGalleryContextType | undefined>(undefined);

/**
 * Props for ImageGalleryProvider
 */
interface ImageGalleryProviderProps {
  children: ReactNode;
}

/**
 * ImageGallery Context Provider
 *
 * Provides centralized state management and database operations
 * for the image gallery application. Handles all IndexedDB interactions
 * and exposes clean hooks for components to consume.
 *
 * Features:
 * - Automatic loading of groups on mount
 * - Automatic loading of images when group is selected
 * - Error handling for all database operations
 * - Loading states for async operations
 * - Optimistic UI updates where appropriate
 *
 * @param props - Provider props
 * @returns The context provider component
 */
export const ImageGalleryProvider: React.FC<ImageGalleryProviderProps> = ({ children }) => {
  /** State */
  const [groups, setGroups] = useState<ImageGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads all groups from IndexedDB
   */
  const loadGroups = useCallback(async (): Promise<void> => {
    setIsLoadingGroups(true);
    setError(null);
    try {
      const allGroups = await getAllGroups();
      setGroups(allGroups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load groups';
      setError(errorMessage);
      console.error('Failed to load groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  /**
   * Loads images for a specific group
   */
  const loadImages = useCallback(async (groupId: number): Promise<void> => {
    setIsLoadingImages(true);
    setError(null);
    try {
      const groupImages = await getImagesByGroup(groupId);
      setImages(groupImages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      setError(errorMessage);
      console.error('Failed to load images:', err);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  /**
   * Load groups on mount
   */
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  /**
   * Load images when selected group changes
   */
  useEffect(() => {
    if (selectedGroupId !== null) {
      loadImages(selectedGroupId);
    } else {
      setImages([]);
    }
  }, [selectedGroupId, loadImages]);

  /**
   * Select a group
   */
  const selectGroup = useCallback((groupId: number | null): void => {
    setSelectedGroupId(groupId);
  }, []);

  /**
   * Create a new group
   */
  const createNewGroup = useCallback(async (name: string): Promise<void> => {
    setError(null);
    try {
      const newGroupId = await createGroup(name);
      await loadGroups();
      // Automatically select the newly created group
      setSelectedGroupId(newGroupId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      throw err;
    }
  }, [loadGroups]);

  /**
   * Rename an existing group
   */
  const renameExistingGroup = useCallback(async (groupId: number, newName: string): Promise<void> => {
    setError(null);
    try {
      await renameGroup(groupId, newName);
      await loadGroups();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename group';
      setError(errorMessage);
      throw err;
    }
  }, [loadGroups]);

  /**
   * Delete a group
   */
  const deleteExistingGroup = useCallback(async (groupId: number): Promise<void> => {
    setError(null);
    try {
      await deleteGroup(groupId);
      await loadGroups();

      // If we deleted the selected group, clear selection
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete group';
      setError(errorMessage);
      throw err;
    }
  }, [loadGroups, selectedGroupId]);

  /**
   * Add an image to a group
   */
  const addImageToGroup = useCallback(async (groupId: number, name: string, blob: Blob): Promise<void> => {
    setError(null);
    try {
      await addImage(groupId, name, blob);
      await loadImages(groupId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add image';
      setError(errorMessage);
      throw err;
    }
  }, [loadImages]);

  /**
   * Rename an existing image
   */
  const renameExistingImage = useCallback(async (imageId: number, newName: string): Promise<void> => {
    setError(null);
    try {
      await renameImage(imageId, newName);
      if (selectedGroupId !== null) {
        await loadImages(selectedGroupId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename image';
      setError(errorMessage);
      throw err;
    }
  }, [selectedGroupId, loadImages]);

  /**
   * Delete an image
   */
  const deleteExistingImage = useCallback(async (imageId: number): Promise<void> => {
    setError(null);
    try {
      await deleteImage(imageId);
      if (selectedGroupId !== null) {
        await loadImages(selectedGroupId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
      throw err;
    }
  }, [selectedGroupId, loadImages]);

  const value: ImageGalleryContextType = {
    // State
    groups,
    selectedGroupId,
    images,
    isLoadingGroups,
    isLoadingImages,
    error,

    // Actions
    selectGroup,
    createNewGroup,
    renameExistingGroup,
    deleteExistingGroup,
    addImageToGroup,
    renameExistingImage,
    deleteExistingImage,
  };

  return (
    <ImageGalleryContext.Provider value={value}>
      {children}
    </ImageGalleryContext.Provider>
  );
};

/**
 * Custom hook to access ImageGallery context
 *
 * Provides access to the entire context including state and actions.
 * Throws an error if used outside of ImageGalleryProvider.
 *
 * @returns The ImageGallery context
 * @throws Error if used outside of ImageGalleryProvider
 *
 * @example
 * ```typescript
 * const { groups, createNewGroup } = useImageGallery();
 * ```
 */
export const useImageGallery = (): ImageGalleryContextType => {
  const context = useContext(ImageGalleryContext);

  if (context === undefined) {
    throw new Error('useImageGallery must be used within ImageGalleryProvider');
  }

  return context;
};

/**
 * Custom hook to access only group-related state and actions
 *
 * Convenience hook that returns only the group-related subset
 * of the context for components that don't need image data.
 *
 * @returns Group-related state and actions
 *
 * @example
 * ```typescript
 * const { groups, selectedGroupId, selectGroup, createNewGroup } = useGroups();
 * ```
 */
export const useGroups = () => {
  const {
    groups,
    selectedGroupId,
    isLoadingGroups,
    selectGroup,
    createNewGroup,
    renameExistingGroup,
    deleteExistingGroup,
  } = useImageGallery();

  return {
    groups,
    selectedGroupId,
    isLoadingGroups,
    selectGroup,
    createNewGroup,
    renameExistingGroup,
    deleteExistingGroup,
  };
};

/**
 * Custom hook to access only image-related state and actions
 *
 * Convenience hook that returns only the image-related subset
 * of the context for components that don't need group data.
 *
 * @returns Image-related state and actions
 *
 * @example
 * ```typescript
 * const { images, selectedGroupId, addImageToGroup } = useImages();
 * ```
 */
export const useImages = () => {
  const {
    images,
    selectedGroupId,
    isLoadingImages,
    addImageToGroup,
    renameExistingImage,
    deleteExistingImage,
  } = useImageGallery();

  return {
    images,
    selectedGroupId,
    isLoadingImages,
    addImageToGroup,
    renameExistingImage,
    deleteExistingImage,
  };
};

/**
 * IndexedDB Service for Image Gallery
 *
 * This service manages all IndexedDB operations for the offline-first image gallery.
 * It stores image groups and their associated images in the browser's IndexedDB.
 *
 * Database Schema:
 * - Database Name: ImageGalleryDB
 * - Version: 1
 *
 * Object Stores:
 * 1. 'groups' - Stores image group metadata
 *    - Key: id (auto-increment)
 *    - Fields: { id, name, createdAt, updatedAt }
 *
 * 2. 'images' - Stores image data as blobs
 *    - Key: id (auto-increment)
 *    - Fields: { id, groupId, name, blob, createdAt }
 *    - Index: groupId (for querying images by group)
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Represents an image group in the database
 */
export interface ImageGroup {
  /** Auto-generated unique identifier */
  id: number;
  /** User-defined name of the group */
  name: string;
  /** ISO timestamp when the group was created */
  createdAt: string;
  /** ISO timestamp when the group was last updated */
  updatedAt: string;
}

/**
 * Represents an image stored in the database
 */
export interface StoredImage {
  /** Auto-generated unique identifier */
  id: number;
  /** ID of the group this image belongs to */
  groupId: number;
  /** Filename or name of the image */
  name: string;
  /** The actual image data as a Blob */
  blob: Blob;
  /** ISO timestamp when the image was added */
  createdAt: string;
}

/**
 * Input type for creating a new group (before auto-generated fields are added)
 */
type GroupInput = Omit<ImageGroup, 'id'>;

/**
 * Input type for creating a new image (before auto-generated fields are added)
 */
type ImageInput = Omit<StoredImage, 'id'>;

// ============================================
// CONSTANTS
// ============================================

const DB_NAME = 'ImageGalleryDB';
const DB_VERSION = 1;

// ============================================
// DATABASE CONNECTION
// ============================================

/**
 * Opens or creates the IndexedDB database
 *
 * This function handles:
 * - Creating the database if it doesn't exist
 * - Upgrading the database schema if the version changes
 * - Creating object stores and indexes
 *
 * @returns Promise that resolves to the database instance
 * @throws Error if the database fails to open
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Called when database is first created or version is upgraded
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create 'groups' object store if it doesn't exist
      if (!db.objectStoreNames.contains('groups')) {
        const groupStore = db.createObjectStore('groups', {
          keyPath: 'id',
          autoIncrement: true
        });
        groupStore.createIndex('name', 'name', { unique: false });
      }

      // Create 'images' object store if it doesn't exist
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', {
          keyPath: 'id',
          autoIncrement: true
        });
        // Index to query images by group
        imageStore.createIndex('groupId', 'groupId', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      reject(new Error(`Database failed to open: ${error?.message || 'Unknown error'}`));
    };
  });
};

// ============================================
// GROUP OPERATIONS
// ============================================

/**
 * Creates a new image group
 *
 * The group is created with the current timestamp for both
 * createdAt and updatedAt fields.
 *
 * @param name - The name of the group
 * @returns Promise that resolves to the ID of the created group
 * @throws Error if the group creation fails
 *
 * @example
 * ```typescript
 * const groupId = await createGroup('Vacation Photos');
 * console.log(`Created group with ID: ${groupId}`);
 * ```
 */
export const createGroup = async (name: string): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readwrite');
    const store = transaction.objectStore('groups');

    const group: GroupInput = {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const request = store.add(group);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(new Error(`Failed to create group: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Retrieves all image groups from the database
 *
 * Groups are returned in the order they were created.
 *
 * @returns Promise that resolves to an array of all groups
 * @throws Error if fetching groups fails
 *
 * @example
 * ```typescript
 * const groups = await getAllGroups();
 * groups.forEach(group => console.log(group.name));
 * ```
 */
export const getAllGroups = async (): Promise<ImageGroup[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readonly');
    const store = transaction.objectStore('groups');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as ImageGroup[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get groups: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Retrieves a single group by its ID
 *
 * @param id - The unique identifier of the group
 * @returns Promise that resolves to the group object, or null if not found
 * @throws Error if the database operation fails
 *
 * @example
 * ```typescript
 * const group = await getGroup(1);
 * if (group) {
 *   console.log(`Found group: ${group.name}`);
 * }
 * ```
 */
export const getGroup = async (id: number): Promise<ImageGroup | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readonly');
    const store = transaction.objectStore('groups');
    const request = store.get(id);

    request.onsuccess = () => {
      resolve((request.result as ImageGroup) || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get group: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Renames an existing image group
 *
 * Updates the group's name and sets the updatedAt timestamp
 * to the current time.
 *
 * @param groupId - The ID of the group to rename
 * @param newName - The new name for the group
 * @returns Promise that resolves when rename is complete
 * @throws Error if rename fails or group doesn't exist
 *
 * @example
 * ```typescript
 * await renameGroup(1, 'Summer Vacation 2024');
 * console.log('Group renamed successfully');
 * ```
 */
export const renameGroup = async (groupId: number, newName: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readwrite');
    const store = transaction.objectStore('groups');
    const getRequest = store.get(groupId);

    getRequest.onsuccess = () => {
      const group = getRequest.result as ImageGroup | undefined;

      if (!group) {
        reject(new Error(`Group with ID ${groupId} not found`));
        return;
      }

      // Update the group name and timestamp
      group.name = newName;
      group.updatedAt = new Date().toISOString();

      const updateRequest = store.put(group);

      updateRequest.onsuccess = () => {
        resolve();
      };

      updateRequest.onerror = () => {
        reject(new Error(`Failed to rename group: ${updateRequest.error?.message || 'Unknown error'}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get group: ${getRequest.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Deletes a group and all its associated images
 *
 * This is a cascading delete operation - all images in the group
 * will be deleted before the group itself is removed.
 *
 * @param groupId - The ID of the group to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 *
 * @example
 * ```typescript
 * await deleteGroup(1);
 * console.log('Group and all its images deleted');
 * ```
 */
export const deleteGroup = async (groupId: number): Promise<void> => {
  const db = await openDB();

  // First delete all images in the group
  await deleteImagesByGroup(groupId);

  // Then delete the group itself
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['groups'], 'readwrite');
    const store = transaction.objectStore('groups');
    const request = store.delete(groupId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete group: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

// ============================================
// IMAGE OPERATIONS
// ============================================

/**
 * Adds an image to a specific group
 *
 * The image data is stored as a Blob, which allows storing
 * the binary image data efficiently in IndexedDB.
 *
 * @param groupId - The ID of the group to add the image to
 * @param name - The filename or display name for the image
 * @param blob - The image data as a Blob object
 * @returns Promise that resolves to the ID of the created image
 * @throws Error if adding the image fails
 *
 * @example
 * ```typescript
 * const imageBlob = new Blob([imageData], { type: 'image/jpeg' });
 * const imageId = await addImage(1, 'vacation.jpg', imageBlob);
 * console.log(`Image saved with ID: ${imageId}`);
 * ```
 */
export const addImage = async (
  groupId: number,
  name: string,
  blob: Blob
): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');

    const image: ImageInput = {
      groupId,
      name,
      blob,
      createdAt: new Date().toISOString()
    };

    const request = store.add(image);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add image: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Retrieves all images for a specific group
 *
 * Uses an indexed query for efficient retrieval of images
 * belonging to a particular group.
 *
 * @param groupId - The ID of the group to fetch images for
 * @returns Promise that resolves to an array of image objects
 * @throws Error if fetching images fails
 *
 * @example
 * ```typescript
 * const images = await getImagesByGroup(1);
 * images.forEach(img => {
 *   const url = URL.createObjectURL(img.blob);
 *   // Use the url to display the image
 * });
 * ```
 */
export const getImagesByGroup = async (groupId: number): Promise<StoredImage[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const index = store.index('groupId');
    const request = index.getAll(groupId);

    request.onsuccess = () => {
      resolve(request.result as StoredImage[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get images: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Renames an existing image
 *
 * Updates the image's filename/name in the database.
 *
 * @param imageId - The ID of the image to rename
 * @param newName - The new name for the image
 * @returns Promise that resolves when rename is complete
 * @throws Error if rename fails or image doesn't exist
 *
 * @example
 * ```typescript
 * await renameImage(5, 'beach-sunset.jpg');
 * console.log('Image renamed successfully');
 * ```
 */
export const renameImage = async (imageId: number, newName: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const getRequest = store.get(imageId);

    getRequest.onsuccess = () => {
      const image = getRequest.result as StoredImage | undefined;

      if (!image) {
        reject(new Error(`Image with ID ${imageId} not found`));
        return;
      }

      // Update the image name
      image.name = newName;

      const updateRequest = store.put(image);

      updateRequest.onsuccess = () => {
        resolve();
      };

      updateRequest.onerror = () => {
        reject(new Error(`Failed to rename image: ${updateRequest.error?.message || 'Unknown error'}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get image: ${getRequest.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Deletes a specific image by its ID
 *
 * @param imageId - The unique identifier of the image to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 *
 * @example
 * ```typescript
 * await deleteImage(5);
 * console.log('Image deleted successfully');
 * ```
 */
export const deleteImage = async (imageId: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.delete(imageId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete image: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

/**
 * Deletes all images belonging to a specific group
 *
 * This is a helper function used internally by deleteGroup.
 * It iterates through all images in the group using a cursor
 * and deletes them one by one.
 *
 * @param groupId - The ID of the group whose images should be deleted
 * @returns Promise that resolves when all images are deleted
 * @throws Error if deletion fails
 */
const deleteImagesByGroup = async (groupId: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const index = store.index('groupId');
    const request = index.openCursor(groupId);

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete images: ${request.error?.message || 'Unknown error'}`));
    };
  });
};

# TypeScript Architecture Guide

This document provides an overview of the TypeScript implementation in the Image Gallery PWA, including type definitions, interfaces, and best practices used throughout the codebase.

## Table of Contents

- [Type Definitions](#type-definitions)
- [Component Props](#component-props)
- [Database Types](#database-types)
- [Type Safety Features](#type-safety-features)
- [Development Guidelines](#development-guidelines)

## Type Definitions

### Database Types

Located in [src/services/db.ts](src/services/db.ts)

#### `ImageGroup`

Represents an image group in the database.

```typescript
interface ImageGroup {
  /** Auto-generated unique identifier */
  id: number;
  /** User-defined name of the group */
  name: string;
  /** ISO timestamp when the group was created */
  createdAt: string;
  /** ISO timestamp when the group was last updated */
  updatedAt: string;
}
```

**Usage:**
```typescript
const group: ImageGroup = {
  id: 1,
  name: "Vacation Photos",
  createdAt: "2025-01-15T10:30:00.000Z",
  updatedAt: "2025-01-15T10:30:00.000Z"
};
```

#### `StoredImage`

Represents an image stored in the database.

```typescript
interface StoredImage {
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
```

**Usage:**
```typescript
const image: StoredImage = {
  id: 1,
  groupId: 1,
  name: "photo.jpg",
  blob: new Blob([imageData], { type: 'image/jpeg' }),
  createdAt: "2025-01-15T10:35:00.000Z"
};
```

### Internal Types

These types are used internally within the database service:

#### `GroupInput`

Input type for creating a new group (before auto-generated fields are added).

```typescript
type GroupInput = Omit<ImageGroup, 'id'>;
```

#### `ImageInput`

Input type for creating a new image (before auto-generated fields are added).

```typescript
type ImageInput = Omit<StoredImage, 'id'>;
```

## Component Props

### GroupList Component

Located in [src/components/GroupList.tsx](src/components/GroupList.tsx)

```typescript
interface GroupListProps {
  /** Array of group objects from IndexedDB */
  groups: ImageGroup[];
  /** Currently selected group ID, or null if no group is selected */
  selectedGroupId: number | null;
  /** Callback function when a group is selected */
  onSelectGroup: (groupId: number) => void;
  /** Callback function to create a new group */
  onCreateGroup: (name: string) => Promise<void>;
  /** Callback function to delete a group */
  onDeleteGroup: (groupId: number) => Promise<void>;
}
```

**Example:**
```typescript
<GroupList
  groups={groups}
  selectedGroupId={1}
  onSelectGroup={(id) => setSelectedGroupId(id)}
  onCreateGroup={async (name) => { await createGroup(name); }}
  onDeleteGroup={async (id) => { await deleteGroup(id); }}
/>
```

### ImageGallery Component

Located in [src/components/ImageGallery.tsx](src/components/ImageGallery.tsx)

```typescript
interface ImageGalleryProps {
  /** The currently selected group ID, or null if no group is selected */
  groupId: number | null;
  /** Array of image objects from IndexedDB for the selected group */
  images: StoredImage[];
  /** Callback to add a new image to a group */
  onAddImage: (groupId: number, name: string, blob: Blob) => Promise<void>;
  /** Callback to delete an image */
  onDeleteImage: (imageId: number) => Promise<void>;
}
```

**Example:**
```typescript
<ImageGallery
  groupId={selectedGroupId}
  images={images}
  onAddImage={async (groupId, name, blob) => {
    await addImage(groupId, name, blob);
  }}
  onDeleteImage={async (imageId) => {
    await deleteImage(imageId);
  }}
/>
```

### ImageCard Component

```typescript
interface ImageCardProps {
  /** Image object from IndexedDB */
  image: StoredImage;
  /** Callback to delete the image */
  onDelete: (imageId: number, imageName: string) => Promise<void>;
}
```

## Type Safety Features

### Strict TypeScript Configuration

The project uses strict TypeScript settings in [tsconfig.json](tsconfig.json):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

These settings ensure:
- **No implicit `any`**: All types must be explicitly defined
- **Strict null checks**: Prevents null/undefined errors
- **No unused variables**: Keeps code clean
- **Exhaustive switch cases**: All cases must be handled

### Event Handler Type Safety

All event handlers use proper React event types:

```typescript
// File input change
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
  const files = e.target.files;
  // ...
};

// Drag and drop
const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
  e.preventDefault();
  // ...
};

// Clipboard paste
const handlePaste = (e: ClipboardEvent): void => {
  const items = e.clipboardData?.items;
  // ...
};
```

### Promise Return Types

All async functions explicitly declare their return types:

```typescript
const createGroup = async (name: string): Promise<number> => {
  // Returns the ID of the created group
};

const getAllGroups = async (): Promise<ImageGroup[]> => {
  // Returns array of groups
};

const deleteGroup = async (groupId: number): Promise<void> => {
  // Returns nothing
};
```

### Error Handling with Type Guards

Type-safe error handling throughout the codebase:

```typescript
try {
  await onCreateGroup(trimmedName);
} catch (error) {
  const errorMessage = error instanceof Error
    ? error.message
    : String(error);
  alert('Failed to create group: ' + errorMessage);
}
```

## Development Guidelines

### Adding New Types

When adding new database types:

1. **Define the interface** in `src/services/db.ts`:
```typescript
export interface NewType {
  id: number;
  fieldName: string;
  createdAt: string;
}
```

2. **Export the type** so components can import it:
```typescript
import type { NewType } from '../services/db';
```

3. **Document the fields** with JSDoc comments:
```typescript
export interface NewType {
  /** Auto-generated unique identifier */
  id: number;
  /** Description of the field */
  fieldName: string;
}
```

### Component Best Practices

1. **Always define prop interfaces**:
```typescript
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // ...
};
```

2. **Use typed state hooks**:
```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

3. **Type all function parameters and returns**:
```typescript
const processImage = async (
  file: File,
  groupId: number
): Promise<void> => {
  // ...
};
```

### IndexedDB Type Assertions

When working with IndexedDB, use type assertions carefully:

```typescript
// IDBRequest results need type assertions
request.onsuccess = () => {
  const result = request.result as ImageGroup[];
  resolve(result);
};

// Event targets need casting
const db = (event.target as IDBOpenDBRequest).result;
```

### Utility Type Usage

The codebase uses TypeScript utility types:

- **`Omit<T, K>`**: Creates a type with properties of T except for K
  ```typescript
  type GroupInput = Omit<ImageGroup, 'id'>;
  ```

- **`Pick<T, K>`**: Creates a type with only selected properties
  ```typescript
  type GroupName = Pick<ImageGroup, 'name'>;
  ```

- **`Partial<T>`**: Makes all properties optional
  ```typescript
  type PartialGroup = Partial<ImageGroup>;
  ```

## Type Checking

### Running Type Checks

Check for type errors without building:
```bash
npx tsc --noEmit
```

### IDE Integration

The TypeScript configuration is optimized for IDE support:
- **IntelliSense**: Autocomplete for all types and functions
- **Inline errors**: Real-time type error detection
- **Go to definition**: Navigate to type definitions
- **Refactoring**: Safe renaming with type checking

## Benefits of TypeScript in This Project

1. **Catch Errors Early**: Type errors are caught at compile-time, not runtime
2. **Better Documentation**: Types serve as inline documentation
3. **Improved Refactoring**: Safe refactoring with confidence
4. **Enhanced IDE Support**: Better autocomplete and IntelliSense
5. **Code Maintenance**: Easier to understand and maintain code
6. **API Contracts**: Clear contracts between components and services

## Common Patterns

### Optional Properties

```typescript
interface Config {
  required: string;
  optional?: number;  // May be undefined
}
```

### Union Types

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');
```

### Generic Functions

```typescript
function getById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find(item => item.id === id);
}
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## Contributing

When contributing to this project:

1. Ensure all new code has proper type annotations
2. Run `npx tsc --noEmit` before committing
3. Document complex types with JSDoc comments
4. Follow the existing type patterns in the codebase
5. Avoid using `any` - use `unknown` if type is truly unknown

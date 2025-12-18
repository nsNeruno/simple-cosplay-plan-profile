import { useState } from 'react';
import type { ImageGroup } from '../services/db';
import { useGroups } from '../contexts/ImageGalleryContext';
import PreviewModal from './PreviewModal';

/**
 * GroupList Component
 *
 * Displays an expandable list of image groups in a centered, grid-based layout.
 * Features Material Design styling with dark theme.
 *
 * This component now uses the useGroups hook to access state and actions
 * from the ImageGallery context, providing clean separation of concerns
 * between UI and data layers.
 *
 * Features:
 * - Expandable/collapsible section with prominent title
 * - Grid layout for group cards (responsive columns)
 * - Material Design typography and elevation
 * - Create new groups with inline form
 * - Rename existing groups with inline editing
 * - Delete existing groups with confirmation
 * - Preview group images in modal with diagonal split layout
 * - Visual indication of selected group
 *
 * @returns The rendered group list section
 */
const GroupList: React.FC = () => {
  /** Access group-related state and actions from context */
  const {
    groups,
    selectedGroupId,
    selectGroup,
    createNewGroup,
    renameExistingGroup,
    deleteExistingGroup,
  } = useGroups();

  /** Whether the groups section is expanded */
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  /** Input value for new group name */
  const [newGroupName, setNewGroupName] = useState<string>('');
  /** Whether the create group form is visible */
  const [isCreating, setIsCreating] = useState<boolean>(false);
  /** Preview modal state */
  const [previewGroupId, setPreviewGroupId] = useState<number | null>(null);
  const [previewImages, setPreviewImages] = useState<any[]>([]);

  /**
   * Handles the creation of a new group
   *
   * Validates that the group name is not empty,
   * calls the context action, and resets the form.
   */
  const handleCreateGroup = async (): Promise<void> => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      alert('Please enter a group name');
      return;
    }

    try {
      await createNewGroup(trimmedName);
      setNewGroupName('');
      setIsCreating(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to create group: ' + errorMessage);
    }
  };

  /**
   * Handles group deletion with user confirmation
   *
   * Displays a confirmation dialog before deleting the group
   * and all its associated images.
   *
   * @param groupId - ID of the group to delete
   * @param groupName - Name of the group (used in confirmation message)
   */
  const handleDeleteGroup = async (groupId: number, groupName: string): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete "${groupName}" and all its images?`)) {
      try {
        await deleteExistingGroup(groupId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('Failed to delete group: ' + errorMessage);
      }
    }
  };

  /**
   * Handles opening the preview modal for a group
   *
   * Loads the group's images and opens the preview modal.
   *
   * @param groupId - ID of the group to preview
   */
  const handlePreviewGroup = async (groupId: number): Promise<void> => {
    try {
      // Import the getImagesByGroup function dynamically
      const { getImagesByGroup } = await import('../services/db');
      const groupImages = await getImagesByGroup(groupId);
      setPreviewImages(groupImages);
      setPreviewGroupId(groupId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to load images: ' + errorMessage);
    }
  };

  /**
   * Closes the preview modal
   */
  const handleClosePreview = (): void => {
    setPreviewGroupId(null);
    setPreviewImages([]);
  };

  // Find the preview group
  const previewGroup = groups.find((g) => g.id === previewGroupId);

  return (
    <>
      <section className="mb-8">
        {/* Section Header - Expandable with prominent title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-display-small">Image Groups</h2>
            <p className="text-body-medium mt-1">
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} •
              Organize your images into collections
            </p>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-text ml-4"
            aria-label={isExpanded ? 'Collapse groups' : 'Expand groups'}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Create New Group Section */}
          <div className="card-standard">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="btn-filled w-full"
              >
                + Create New Group
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                  placeholder="Enter group name"
                  className="input-base"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGroup}
                    className="btn-success flex-1"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewGroupName('');
                    }}
                    className="btn-outlined flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <div className="card-spacious text-center">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-headline-small mb-2">No groups yet</h3>
              <p className="text-body-medium">
                Create your first group to start organizing images
              </p>
            </div>
          ) : (
            <div className="grid-responsive">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isSelected={selectedGroupId === group.id}
                  onSelect={() => selectGroup(group.id)}
                  onRename={(newName: string) => renameExistingGroup(group.id, newName)}
                  onPreview={() => handlePreviewGroup(group.id)}
                  onDelete={() => handleDeleteGroup(group.id, group.name)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      </section>

      {/* Preview Modal */}
      {previewGroup && (
        <PreviewModal
          isOpen={previewGroupId !== null}
          onClose={handleClosePreview}
          groupName={previewGroup.name}
          images={previewImages}
        />
      )}
    </>
  );
};

/**
 * Props for the GroupCard component
 */
interface GroupCardProps {
  /** The group data */
  group: ImageGroup;
  /** Whether this group is currently selected */
  isSelected: boolean;
  /** Callback when the card is clicked */
  onSelect: () => void;
  /** Callback when rename is requested */
  onRename: (newName: string) => Promise<void>;
  /** Callback when preview is requested */
  onPreview: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
}

/**
 * GroupCard Component
 *
 * Displays a single group as a card in the grid.
 * Provides visual feedback for selection and hover states.
 * Supports inline renaming and preview.
 *
 * @param props - Component props
 * @returns The rendered group card
 */
const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isSelected,
  onSelect,
  onRename,
  onPreview,
  onDelete
}) => {
  /** Whether the card is in rename mode */
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  /** Input value for the new name */
  const [newName, setNewName] = useState<string>(group.name);

  /**
   * Handles the rename operation
   */
  const handleRename = async (): Promise<void> => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert('Please enter a group name');
      return;
    }

    if (trimmedName === group.name) {
      // No change, just exit rename mode
      setIsRenaming(false);
      return;
    }

    try {
      await onRename(trimmedName);
      setIsRenaming(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to rename group: ' + errorMessage);
      setNewName(group.name); // Reset to original name
    }
  };

  /**
   * Cancels the rename operation
   */
  const handleCancelRename = (): void => {
    setNewName(group.name);
    setIsRenaming(false);
  };

  return (
    <div
      className={`
        card-standard transition-all duration-200 relative group/card
        ${isRenaming ? '' : 'cursor-pointer'}
        ${isSelected
          ? 'ring-2 ring-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
          : 'hover:shadow-lg'
        }
      `}
      onClick={isRenaming ? undefined : onSelect}
    >
      {/* Group Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-lg mb-3">
        <svg
          className="w-6 h-6 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>

      {/* Group Name or Rename Input */}
      {isRenaming ? (
        <div className="mb-3 space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') handleCancelRename();
            }}
            className="input-base text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
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
        <h3 className="text-title-large mb-1 truncate" title={group.name}>
          {group.name}
        </h3>
      )}

      {/* Created Date */}
      <p className="text-body-medium">
        Created {new Date(group.createdAt).toLocaleDateString()}
      </p>

      {/* Selected Badge */}
      {isSelected && !isRenaming && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          Selected
        </div>
      )}

      {/* Action Buttons (show on hover) */}
      {!isRenaming && (
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs rounded-lg transition-colors"
          >
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-lg transition-colors"
          >
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn-danger px-3 py-1.5 text-xs"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupList;

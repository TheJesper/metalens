import { Button } from '@/ui-lib'
import { FolderPlus, X } from 'lucide-react'
import { StoredImage } from '../lib/storage'
import { ImageThumbnail } from './ImageThumbnail'

interface ThumbnailGridProps {
  images: StoredImage[]
  selectedIds: string[]
  selectionMode: boolean
  onSelectToggle: (id: string) => void
  onSelectionModeChange: (mode: boolean) => void
  onImageClick: (image: StoredImage) => void
  onRemoveImage: (id: string) => void
  onCreateBatch: () => void
  getImageStatus: (id: string) => 'pending' | 'processing' | 'complete' | 'error'
}

export function ThumbnailGrid({
  images,
  selectedIds,
  selectionMode,
  onSelectToggle,
  onSelectionModeChange,
  onImageClick,
  onRemoveImage,
  onCreateBatch,
  getImageStatus,
}: ThumbnailGridProps) {
  if (images.length === 0) return null

  const handleImageClick = (image: StoredImage) => {
    if (selectionMode) {
      onSelectToggle(image.id)
    } else {
      onImageClick(image)
    }
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectionModeChange(false)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionModeChange(true)}
            >
              Select
            </Button>
          )}
        </div>

        {selectionMode && selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onCreateBatch}
              className="gap-1"
            >
              <FolderPlus className="h-4 w-4" />
              Create Batch
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {images.map((image) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            status={getImageStatus(image.id)}
            selected={selectedIds.includes(image.id)}
            selectionMode={selectionMode}
            onClick={() => handleImageClick(image)}
            onRemove={() => onRemoveImage(image.id)}
          />
        ))}
      </div>
    </div>
  )
}

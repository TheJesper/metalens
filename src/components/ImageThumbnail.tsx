import { Badge, cn } from '@covers/ui'
import { Check, AlertCircle, Loader2, X } from 'lucide-react'
import { StoredImage } from '../lib/storage'

interface ImageThumbnailProps {
  image: StoredImage
  status?: 'pending' | 'processing' | 'complete' | 'error'
  selected?: boolean
  selectionMode?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export function ImageThumbnail({
  image,
  status = 'complete',
  selected = false,
  selectionMode = false,
  onClick,
  onRemove,
}: ImageThumbnailProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.()
  }

  return (
    <div
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer transition-all',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        selectionMode && 'hover:ring-2 hover:ring-primary/50'
      )}
      onClick={onClick}
      title={image.filename}
    >
      {/* Thumbnail Image */}
      <img
        src={image.thumbnail}
        alt={image.filename}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Selection Checkbox */}
      {selectionMode && (
        <div
          className={cn(
            'absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            selected
              ? 'bg-primary border-primary'
              : 'border-white/70 bg-black/30'
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        {status === 'processing' && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
          </Badge>
        )}
        {status === 'error' && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Remove Button (on hover) */}
      {!selectionMode && onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Filename Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate">{image.filename}</p>
      </div>
    </div>
  )
}

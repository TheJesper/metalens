import { RefreshCw, Trash2, MoveRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/ui-lib'

interface ImageHoverMenuProps {
  onRescan?: () => void
  onDiscard?: () => void
  onMove?: () => void
  onMore?: () => void
  className?: string
}

export function ImageHoverMenu({
  onRescan,
  onDiscard,
  onMove,
  onMore,
  className,
}: ImageHoverMenuProps) {
  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'flex items-center justify-center gap-1',
        className
      )}
    >
      {onRescan && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRescan()
          }}
          className="p-1.5 rounded-md bg-primary/90 text-white hover:bg-primary transition-colors shadow-lg"
          title="Rescan / Re-analyze"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}

      {onMove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMove()
          }}
          className="p-1.5 rounded-md bg-blue-600/90 text-white hover:bg-blue-600 transition-colors shadow-lg"
          title="Move to another location"
        >
          <MoveRight className="h-3.5 w-3.5" />
        </button>
      )}

      {onDiscard && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDiscard()
          }}
          className="p-1.5 rounded-md bg-destructive/90 text-white hover:bg-destructive transition-colors shadow-lg"
          title="Discard / Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {onMore && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMore()
          }}
          className="p-1.5 rounded-md bg-muted/90 text-foreground hover:bg-muted transition-colors shadow-lg"
          title="More options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

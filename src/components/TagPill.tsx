import { X, Search } from 'lucide-react'
import { cn } from '@covers/ui'

interface TagPillProps {
  tag: string
  onRemove?: () => void
  onSearch?: () => void
  removable?: boolean
  className?: string
}

export function TagPill({ tag, onRemove, onSearch, removable = true, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
        'bg-primary/20 text-primary border border-primary/30',
        'hover:bg-primary/30 transition-colors group',
        className
      )}
    >
      <span>{tag}</span>
      {onSearch && (
        <button
          onClick={onSearch}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary-foreground"
          title="Search Google"
        >
          <Search className="h-3 w-3" />
        </button>
      )}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="opacity-60 hover:opacity-100 transition-opacity hover:text-destructive"
          title="Remove tag"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )
}

interface AddTagButtonProps {
  onClick: () => void
}

export function AddTagButton({ onClick }: AddTagButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
        'border-2 border-dashed border-muted-foreground/30 text-muted-foreground',
        'hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all'
      )}
    >
      <span>+ Add</span>
    </button>
  )
}

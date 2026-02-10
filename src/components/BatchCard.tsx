import { useState } from 'react'
import { Card, CardContent, Badge, Button, cn } from '@/ui-lib'
import { FolderOpen, Edit2, Trash2, ChevronDown, ChevronRight, Check, X } from 'lucide-react'
import { Batch } from '../lib/storage'

interface BatchCardProps {
  batch: Batch
  imageCount: number
  onToggleExpanded: () => void
  onRename: (newName: string) => void
  onDelete: () => void
  onViewImages: () => void
}

export function BatchCard({
  batch,
  imageCount,
  onToggleExpanded,
  onRename,
  onDelete,
  onViewImages,
}: BatchCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(batch.name)

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== batch.name) {
      onRename(editedName)
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Delete batch "${batch.name}"? Images will be kept in the library.`)) {
      onDelete()
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={onToggleExpanded}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              {batch.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') setIsEditing(false)
                    }}
                    className="px-2 py-1 rounded border bg-background text-sm flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded hover:bg-primary/10 text-primary"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{batch.name}</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {imageCount} {imageCount === 1 ? 'image' : 'images'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewImages}
              className="h-8 px-2"
            >
              View
            </Button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete batch"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>Created {new Date(batch.createdAt).toLocaleDateString()}</span>
          <Badge variant="secondary" className="text-[10px]">
            {batch.id.slice(0, 8)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

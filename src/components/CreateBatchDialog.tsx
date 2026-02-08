import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@covers/ui'
import { FolderPlus } from 'lucide-react'

interface CreateBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageCount: number
  onCreateBatch: (name: string) => void
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  imageCount,
  onCreateBatch,
}: CreateBatchDialogProps) {
  const [name, setName] = useState('')

  const handleCreate = () => {
    if (name.trim()) {
      onCreateBatch(name.trim())
      setName('')
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create Batch
          </DialogTitle>
          <DialogDescription>
            Group {imageCount} selected image{imageCount !== 1 ? 's' : ''} into a named batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="batch-name">Batch Name</Label>
            <Input
              id="batch-name"
              placeholder="e.g., Product Photos, Event 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

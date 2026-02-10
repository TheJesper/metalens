import { useState } from 'react'
import { Card, CardContent, Button, Badge, cn } from '@/ui-lib'
import { User, X, UserPlus } from 'lucide-react'
import { Person, FaceData, assignFaceToPerson, createPerson } from '../lib/faces'

interface FaceAssignmentDialogProps {
  face: FaceData
  persons: Person[]
  onClose: () => void
  onAssigned: () => void
}

export function FaceAssignmentDialog({
  face,
  persons,
  onClose,
  onAssigned,
}: FaceAssignmentDialogProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')

  const handleAssign = (personId: string) => {
    assignFaceToPerson(face.id, personId)
    onAssigned()
  }

  const handleCreateAndAssign = () => {
    if (!newPersonName.trim()) return
    const newPerson = createPerson(newPersonName)
    assignFaceToPerson(face.id, newPerson.id)
    onAssigned()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Assign Face to Person</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Face Preview */}
          <div className="mb-6 p-4 rounded-lg bg-secondary/50 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <div className="text-sm font-medium">Detected Face</div>
              <div className="text-xs text-muted-foreground">
                Confidence: {Math.round(face.confidence * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Image: {face.imageId.slice(0, 8)}...
              </div>
            </div>
          </div>

          {/* Create New Person */}
          {isCreatingNew ? (
            <div className="mb-4 p-4 rounded-lg border-2 border-primary">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Create New Person</span>
              </div>
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAssign()
                  if (e.key === 'Escape') setIsCreatingNew(false)
                }}
                placeholder="Enter person name..."
                className="w-full px-3 py-2 rounded-md border bg-background text-sm mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateAndAssign}
                  disabled={!newPersonName.trim()}
                >
                  Create & Assign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingNew(false)
                    setNewPersonName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreatingNew(true)}
              className="w-full mb-4 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create New Person
            </Button>
          )}

          {/* Existing Persons */}
          {persons.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-3">Or assign to existing person:</div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {persons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleAssign(person.id)}
                    className="w-full p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {person.faceIds.length} {person.faceIds.length === 1 ? 'face' : 'faces'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {persons.length === 0 && !isCreatingNew && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No persons yet. Create one to assign this face.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

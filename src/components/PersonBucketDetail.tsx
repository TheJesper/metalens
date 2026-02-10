import { useState } from 'react'
import { Card, CardContent, Button, Badge, cn } from '@/ui-lib'
import { ArrowLeft, User, Edit2, Check, X, Trash2, MoveRight } from 'lucide-react'
import {
  Person,
  getFacesForPerson,
  updatePerson,
  unassignFaceFromPerson,
  FaceData,
  getPersonById,
  getAllPersons,
  assignFaceToPerson,
} from '../lib/faces'
import { ImageHoverMenu } from './ImageHoverMenu'

interface PersonBucketDetailProps {
  person: Person
  onBack: () => void
  onUpdate: () => void
}

export function PersonBucketDetail({ person, onBack, onUpdate }: PersonBucketDetailProps) {
  const [faces, setFaces] = useState(() => getFacesForPerson(person.id))
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(person.name)
  const [selectedFaces, setSelectedFaces] = useState<string[]>([])
  const [showMoveDialog, setShowMoveDialog] = useState(false)

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== person.name) {
      updatePerson(person.id, { name: editedName })
      onUpdate()
    }
    setIsEditingName(false)
  }

  const handleRemoveFace = (faceId: string) => {
    if (confirm('Remove this face from the person?')) {
      unassignFaceFromPerson(faceId)
      setFaces(getFacesForPerson(person.id))
      onUpdate()
    }
  }

  const handleMoveSelected = (targetPersonId: string) => {
    selectedFaces.forEach((faceId) => {
      unassignFaceFromPerson(faceId)
      assignFaceToPerson(faceId, targetPersonId)
    })
    setSelectedFaces([])
    setShowMoveDialog(false)
    setFaces(getFacesForPerson(person.id))
    onUpdate()
  }

  const handleSelectToggle = (faceId: string) => {
    setSelectedFaces((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    )
  }

  const otherPersons = getAllPersons().filter((p) => p.id !== person.id)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') setIsEditingName(false)
                      }}
                      className="px-2 py-1 rounded border bg-background text-lg font-bold"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 rounded hover:bg-primary/10 text-primary"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{person.name}</h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {faces.length} {faces.length === 1 ? 'face' : 'faces'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {selectedFaces.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedFaces.length} selected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoveDialog(true)}
                className="gap-2"
              >
                <MoveRight className="h-4 w-4" />
                Move to...
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Remove ${selectedFaces.length} faces?`)) {
                    selectedFaces.forEach((faceId) => unassignFaceFromPerson(faceId))
                    setSelectedFaces([])
                    setFaces(getFacesForPerson(person.id))
                    onUpdate()
                  }
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFaces([])}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Face Grid */}
        {faces.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No faces assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {faces.map((face) => {
              const isSelected = selectedFaces.includes(face.id)
              return (
                <div
                  key={face.id}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer transition-all',
                    isSelected && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => handleSelectToggle(face.id)}
                >
                  {/* Placeholder for face thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground/30" />
                  </div>

                  {/* Hover Actions */}
                  <ImageHoverMenu
                    onDiscard={() => handleRemoveFace(face.id)}
                    onMove={() => {
                      setSelectedFaces([face.id])
                      setShowMoveDialog(true)
                    }}
                  />

                  {/* Selection Checkbox */}
                  <div
                    className={cn(
                      'absolute top-2 left-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all z-10',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-white/70 bg-black/30 opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Confidence Badge */}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {Math.round(face.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Move Dialog */}
        {showMoveDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Move {selectedFaces.length} {selectedFaces.length === 1 ? 'face' : 'faces'} to...
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                  {otherPersons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No other persons available
                    </p>
                  ) : (
                    otherPersons.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleMoveSelected(p.id)}
                        className="w-full p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.faceIds.length} faces
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowMoveDialog(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

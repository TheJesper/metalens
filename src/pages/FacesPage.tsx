import { useState, useEffect } from 'react'
import { Card, CardContent, Badge, Button, cn } from '@/ui-lib'
import { Users, UserPlus, AlertCircle, Loader2 } from 'lucide-react'
import {
  getAllPersons,
  getUnassignedFaces,
  getAllFaces,
  Person,
  FaceData,
  createPerson,
  deletePerson,
  isFaceDetectionEnabled,
  setFaceDetectionEnabled,
} from '../lib/faces'
import { PersonBucket } from '../components/PersonBucket'
import { PersonBucketDetail } from '../components/PersonBucketDetail'
import { FaceAssignmentDialog } from '../components/FaceAssignmentDialog'

export function FacesPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [unassignedFaces, setUnassignedFaces] = useState<FaceData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedFace, setSelectedFace] = useState<FaceData | null>(null)
  const [faceDetectionEnabled, setFaceDetectionEnabledState] = useState(() => isFaceDetectionEnabled())
  const [isCreatingPerson, setIsCreatingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPersons(getAllPersons())
    setUnassignedFaces(getUnassignedFaces())
  }

  const handleToggleFaceDetection = () => {
    const newValue = !faceDetectionEnabled
    setFaceDetectionEnabled(newValue)
    setFaceDetectionEnabledState(newValue)
  }

  const handleCreatePerson = () => {
    if (!newPersonName.trim()) return
    createPerson(newPersonName)
    setNewPersonName('')
    setIsCreatingPerson(false)
    loadData()
  }

  const handleDeletePerson = (id: string) => {
    if (confirm('Delete this person? All face assignments will be removed.')) {
      deletePerson(id)
      if (selectedPerson?.id === id) {
        setSelectedPerson(null)
      }
      loadData()
    }
  }

  const handleAssignFace = (face: FaceData) => {
    setSelectedFace(face)
    setShowAssignDialog(true)
  }

  const handleAssignmentComplete = () => {
    setShowAssignDialog(false)
    setSelectedFace(null)
    loadData()
  }

  if (selectedPerson) {
    return (
      <PersonBucketDetail
        person={selectedPerson}
        onBack={() => setSelectedPerson(null)}
        onUpdate={loadData}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Face Recognition
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage detected faces and person groupings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={faceDetectionEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleFaceDetection}
            >
              Face Detection: {faceDetectionEnabled ? 'ON' : 'OFF'}
            </Button>
            {isCreatingPerson ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreatePerson()
                    if (e.key === 'Escape') setIsCreatingPerson(false)
                  }}
                  placeholder="Person name"
                  className="px-3 py-1.5 rounded-md border bg-background text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleCreatePerson}>
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreatingPerson(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingPerson(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                New Person
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{persons.length}</div>
              <div className="text-xs text-muted-foreground">Persons</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{unassignedFaces.length}</div>
              <div className="text-xs text-muted-foreground">Unassigned Faces</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getAllFaces().length}</div>
              <div className="text-xs text-muted-foreground">Total Faces</div>
            </CardContent>
          </Card>
        </div>

        {/* Unassigned Faces */}
        {unassignedFaces.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <h2 className="font-semibold">Unassigned Faces</h2>
                <Badge variant="secondary">{unassignedFaces.length}</Badge>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {unassignedFaces.map((face) => (
                  <div
                    key={face.id}
                    onClick={() => handleAssignFace(face)}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary cursor-pointer flex items-center justify-center transition-all hover:scale-105"
                    title="Click to assign to person"
                  >
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Person Buckets */}
        <div>
          <h2 className="text-lg font-semibold mb-4">People ({persons.length})</h2>
          {persons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No persons yet</p>
                <Button onClick={() => setIsCreatingPerson(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create First Person
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {persons.map((person) => (
                <PersonBucket
                  key={person.id}
                  person={person}
                  onClick={() => setSelectedPerson(person)}
                  onDelete={() => handleDeletePerson(person.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Dialog */}
      {showAssignDialog && selectedFace && (
        <FaceAssignmentDialog
          face={selectedFace}
          persons={persons}
          onClose={() => setShowAssignDialog(false)}
          onAssigned={handleAssignmentComplete}
        />
      )}
    </div>
  )
}

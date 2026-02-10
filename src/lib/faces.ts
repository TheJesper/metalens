// Facial recognition data models and storage for MetaLens

export interface FaceData {
  id: string
  imageId: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  personId?: string
  estimatedAge?: number
  estimatedGender?: string
  detectedAt: string
}

export interface Person {
  id: string
  name: string
  faceIds: string[]
  createdAt: string
  updatedAt: string
}

const FACES_STORAGE_KEY = 'metalens_faces'
const PERSONS_STORAGE_KEY = 'metalens_persons'
const FACE_DETECTION_ENABLED_KEY = 'metalens_face_detection_enabled'

// Get all face data
export function getAllFaces(): FaceData[] {
  try {
    const data = localStorage.getItem(FACES_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load faces:', error)
    return []
  }
}

// Get faces for a specific image
export function getFacesByImageId(imageId: string): FaceData[] {
  return getAllFaces().filter(face => face.imageId === imageId)
}

// Add face data
export function addFace(face: Omit<FaceData, 'id' | 'detectedAt'>): FaceData {
  const newFace: FaceData = {
    ...face,
    id: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    detectedAt: new Date().toISOString(),
  }

  const faces = getAllFaces()
  faces.push(newFace)
  saveFaces(faces)

  return newFace
}

// Update face data
export function updateFace(id: string, updates: Partial<FaceData>): void {
  const faces = getAllFaces()
  const index = faces.findIndex(face => face.id === id)

  if (index !== -1) {
    faces[index] = { ...faces[index], ...updates }
    saveFaces(faces)
  }
}

// Remove face data
export function removeFace(id: string): void {
  const faces = getAllFaces().filter(face => face.id !== id)
  saveFaces(faces)
}

// Remove all faces for an image
export function removeFacesByImageId(imageId: string): void {
  const faces = getAllFaces().filter(face => face.imageId !== imageId)
  saveFaces(faces)
}

// Get all persons
export function getAllPersons(): Person[] {
  try {
    const data = localStorage.getItem(PERSONS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load persons:', error)
    return []
  }
}

// Get person by ID
export function getPersonById(id: string): Person | undefined {
  return getAllPersons().find(person => person.id === id)
}

// Create person
export function createPerson(name: string): Person {
  const person: Person = {
    id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    faceIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const persons = getAllPersons()
  persons.push(person)
  savePersons(persons)

  return person
}

// Update person
export function updatePerson(id: string, updates: Partial<Person>): void {
  const persons = getAllPersons()
  const index = persons.findIndex(person => person.id === id)

  if (index !== -1) {
    persons[index] = {
      ...persons[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    savePersons(persons)
  }
}

// Delete person
export function deletePerson(id: string): void {
  // Unassign all faces from this person
  const faces = getAllFaces()
  faces.forEach(face => {
    if (face.personId === id) {
      updateFace(face.id, { personId: undefined })
    }
  })

  const persons = getAllPersons().filter(person => person.id !== id)
  savePersons(persons)
}

// Assign face to person
export function assignFaceToPerson(faceId: string, personId: string): void {
  // Update face
  updateFace(faceId, { personId })

  // Add face to person's faceIds
  const person = getPersonById(personId)
  if (person && !person.faceIds.includes(faceId)) {
    updatePerson(personId, {
      faceIds: [...person.faceIds, faceId],
    })
  }
}

// Unassign face from person
export function unassignFaceFromPerson(faceId: string): void {
  const face = getAllFaces().find(f => f.id === faceId)
  if (!face || !face.personId) return

  // Remove from person's faceIds
  const person = getPersonById(face.personId)
  if (person) {
    updatePerson(person.id, {
      faceIds: person.faceIds.filter(id => id !== faceId),
    })
  }

  // Clear personId from face
  updateFace(faceId, { personId: undefined })
}

// Get unassigned faces
export function getUnassignedFaces(): FaceData[] {
  return getAllFaces().filter(face => !face.personId)
}

// Get faces for person
export function getFacesForPerson(personId: string): FaceData[] {
  return getAllFaces().filter(face => face.personId === personId)
}

// Face detection enabled setting
export function isFaceDetectionEnabled(): boolean {
  try {
    const value = localStorage.getItem(FACE_DETECTION_ENABLED_KEY)
    return value === 'true'
  } catch {
    return false
  }
}

export function setFaceDetectionEnabled(enabled: boolean): void {
  localStorage.setItem(FACE_DETECTION_ENABLED_KEY, enabled.toString())
}

// Private: Save functions
function saveFaces(faces: FaceData[]): void {
  try {
    localStorage.setItem(FACES_STORAGE_KEY, JSON.stringify(faces))
  } catch (error) {
    console.error('Failed to save faces:', error)
  }
}

function savePersons(persons: Person[]): void {
  try {
    localStorage.setItem(PERSONS_STORAGE_KEY, JSON.stringify(persons))
  } catch (error) {
    console.error('Failed to save persons:', error)
  }
}

// Clear all face data
export function clearAllFaceData(): void {
  localStorage.removeItem(FACES_STORAGE_KEY)
  localStorage.removeItem(PERSONS_STORAGE_KEY)
}

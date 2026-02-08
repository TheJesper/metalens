import { AnalysisResult } from './adapters'

const STORAGE_KEY = 'metalens_images'
const BATCHES_KEY = 'metalens_batches'

export interface StoredImage {
  id: string
  filename: string
  thumbnail: string  // base64 data URL
  result?: AnalysisResult
  batchId?: string
  addedAt: string
}

export interface Batch {
  id: string
  name: string
  imageIds: string[]
  createdAt: string
  expanded: boolean
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Image Storage
export function getStoredImages(): StoredImage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveImages(images: StoredImage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
  } catch (e) {
    console.warn('Storage limit reached:', e)
  }
}

export function addImage(image: StoredImage): void {
  const images = getStoredImages()
  images.push(image)
  saveImages(images)
}

export function updateImage(id: string, updates: Partial<StoredImage>): void {
  const images = getStoredImages()
  const index = images.findIndex(img => img.id === id)
  if (index !== -1) {
    images[index] = { ...images[index], ...updates }
    saveImages(images)
  }
}

export function removeImage(id: string): void {
  const images = getStoredImages().filter(img => img.id !== id)
  saveImages(images)
}

export function clearAllImages(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(BATCHES_KEY)
}

// Batch Storage
export function getBatches(): Batch[] {
  try {
    const data = localStorage.getItem(BATCHES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveBatches(batches: Batch[]): void {
  try {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches))
  } catch (e) {
    console.warn('Storage limit reached:', e)
  }
}

export function createBatch(name: string, imageIds: string[]): Batch {
  const batch: Batch = {
    id: generateId(),
    name,
    imageIds,
    createdAt: new Date().toISOString(),
    expanded: true,
  }
  const batches = getBatches()
  batches.push(batch)
  saveBatches(batches)

  // Update images with batchId
  const images = getStoredImages()
  imageIds.forEach(imgId => {
    const img = images.find(i => i.id === imgId)
    if (img) img.batchId = batch.id
  })
  saveImages(images)

  return batch
}

export function renameBatch(id: string, name: string): void {
  const batches = getBatches()
  const batch = batches.find(b => b.id === id)
  if (batch) {
    batch.name = name
    saveBatches(batches)
  }
}

export function deleteBatch(id: string): void {
  const batches = getBatches().filter(b => b.id !== id)
  saveBatches(batches)

  // Remove batchId from images (keep images)
  const images = getStoredImages()
  images.forEach(img => {
    if (img.batchId === id) {
      img.batchId = undefined
    }
  })
  saveImages(images)
}

export function toggleBatchExpanded(id: string): void {
  const batches = getBatches()
  const batch = batches.find(b => b.id === id)
  if (batch) {
    batch.expanded = !batch.expanded
    saveBatches(batches)
  }
}

// Thumbnail generation
export async function createThumbnail(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Storage size check
export function getStorageUsage(): { used: number; available: number; percentage: number } {
  let used = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage.getItem(key)?.length || 0
    }
  }
  const available = 5 * 1024 * 1024 // ~5MB typical limit
  return {
    used,
    available,
    percentage: (used / available) * 100,
  }
}

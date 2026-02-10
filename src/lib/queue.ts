// Queue management for MetaLens
// Images are added to queue first, then processed, then moved to Recent/Library

export interface QueueItem {
  id: string
  file: File | null // null after processing (file is converted to thumbnail)
  thumbnail: string
  filename: string
  addedAt: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  processingProgress?: number
  errorMessage?: string
}

const QUEUE_STORAGE_KEY = 'metalens_queue'
const AUTO_PROCESS_KEY = 'metalens_auto_process_queue'

// Get all queue items
export function getQueueItems(): QueueItem[] {
  try {
    const data = localStorage.getItem(QUEUE_STORAGE_KEY)
    if (!data) return []
    const items = JSON.parse(data)
    // File objects don't persist in localStorage, so file will be null after reload
    return items.map((item: QueueItem) => ({ ...item, file: null }))
  } catch (error) {
    console.error('Failed to load queue items:', error)
    return []
  }
}

// Add item to queue
export function addToQueue(item: Omit<QueueItem, 'id' | 'addedAt' | 'status'>): QueueItem {
  const queueItem: QueueItem = {
    ...item,
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString(),
    status: 'pending',
  }

  const items = getQueueItems()
  items.push(queueItem)
  saveQueue(items)

  return queueItem
}

// Update queue item
export function updateQueueItem(id: string, updates: Partial<QueueItem>): void {
  const items = getQueueItems()
  const index = items.findIndex((item) => item.id === id)

  if (index !== -1) {
    items[index] = { ...items[index], ...updates }
    saveQueue(items)
  }
}

// Remove item from queue
export function removeFromQueue(id: string): void {
  const items = getQueueItems().filter((item) => item.id !== id)
  saveQueue(items)
}

// Clear entire queue
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY)
}

// Get queue count by status
export function getQueueStats(): { total: number; pending: number; processing: number; error: number } {
  const items = getQueueItems()
  return {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    processing: items.filter((i) => i.status === 'processing').length,
    error: items.filter((i) => i.status === 'error').length,
  }
}

// Get auto-process setting
export function getAutoProcessQueue(): boolean {
  try {
    const value = localStorage.getItem(AUTO_PROCESS_KEY)
    return value === 'true'
  } catch {
    return true // Default: auto-process enabled
  }
}

// Set auto-process setting
export function setAutoProcessQueue(enabled: boolean): void {
  localStorage.setItem(AUTO_PROCESS_KEY, enabled.toString())
}

// Private: Save queue to localStorage
function saveQueue(items: QueueItem[]): void {
  try {
    // Don't store File objects (too large, can't serialize)
    const serializable = items.map((item) => ({
      ...item,
      file: null,
    }))
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(serializable))
  } catch (error) {
    console.error('Failed to save queue:', error)
    // Handle quota exceeded
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Consider clearing old items.')
    }
  }
}

// Get pending items (not processing, not complete, not error)
export function getPendingQueueItems(): QueueItem[] {
  return getQueueItems().filter((item) => item.status === 'pending')
}

// Get items with errors
export function getErrorQueueItems(): QueueItem[] {
  return getQueueItems().filter((item) => item.status === 'error')
}

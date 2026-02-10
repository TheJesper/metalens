import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, Badge, Progress, Button, cn } from '@/ui-lib'
import {
  Scan,
  Upload,
  Images,
  Settings,
  FolderOpen,
  Trash2,
  HardDrive,
  Sparkles,
  FileJson,
  History,
  GitBranch,
  Info,
  LucideIcon,
  PenTool,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye,
  Wand2,
  Check,
  X,
  Camera,
  Users,
  Download,
} from 'lucide-react'
import { AdapterType, ADAPTER_MODELS, ADAPTERS, mockAdapter, ollamaAdapter, openaiAdapter, claudeAdapter, googleAdapter } from './lib/adapters'
import { EngineSelector } from './components/EngineSelector'
import { ApiKeyDialog } from './components/ApiKeyDialog'
import { ThumbnailGrid } from './components/ThumbnailGrid'
import { CreateBatchDialog } from './components/CreateBatchDialog'
import { ImageDetailPanel } from './components/ImageDetailPanel'
import { CameraCapture } from './components/CameraCapture'
import { BatchCard } from './components/BatchCard'
import { FacesPage } from './pages/FacesPage'
import { SketchPage } from './pages/SketchPage'
import {
  StoredImage,
  getStoredImages,
  addImage,
  updateImage,
  removeImage,
  clearAllImages,
  createThumbnail,
  generateId,
  getStorageUsage,
  createBatch,
  exportMetadataJSON,
  exportFullDataJSON,
  getBatches,
  renameBatch,
  deleteBatch,
  toggleBatchExpanded,
  Batch,
} from './lib/storage'
import {
  QueueItem,
  getQueueItems,
  addToQueue,
  updateQueueItem,
  removeFromQueue,
  clearQueue,
  getQueueStats,
  getAutoProcessQueue,
  setAutoProcessQueue,
} from './lib/queue'

type ProcessingStatus = Record<string, 'pending' | 'processing' | 'complete' | 'error'>
type View = 'analyze' | 'library' | 'batches' | 'faces' | 'sketch' | 'settings'

// Version with Swedish timestamp
const APP_VERSION = 'v1.1.0 (2026-02-10 11:23 CET)'

// Helper component for explorer sidebar buttons
function ExplorerButton({
  icon: Icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  badge?: string | number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </button>
  )
}

// Storage keys
const STORAGE_KEYS = {
  adapter: 'metalens_adapter',
  model: 'metalens_model',
}

// Safe localStorage access
function getStoredAdapter(): AdapterType {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.adapter) as AdapterType
    if (saved && ADAPTER_MODELS[saved]) return saved
  } catch {}
  return 'ollama'
}

function getStoredModel(adapterType: AdapterType): string {
  try {
    const savedModel = localStorage.getItem(STORAGE_KEYS.model)
    const models = ADAPTER_MODELS[adapterType]
    if (savedModel && models.includes(savedModel)) return savedModel
  } catch {}
  return ADAPTER_MODELS[adapterType][0]
}

function App() {
  const [view, setView] = useState<View>('analyze')
  // Initialize directly from localStorage to avoid flash of wrong values
  const [adapter, setAdapter] = useState<AdapterType>(() => getStoredAdapter())
  const [model, setModel] = useState(() => getStoredModel(getStoredAdapter()))
  const [images, setImages] = useState<StoredImage[]>([])
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)

  // Queue system
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [autoProcess, setAutoProcess] = useState(() => getAutoProcessQueue())

  // Batches
  const [batches, setBatches] = useState<Batch[]>(() => getBatches())

  // Selection mode for batching
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialogs
  const [apiKeyDialogAdapter, setApiKeyDialogAdapter] = useState<AdapterType | null>(null)
  const [showCreateBatch, setShowCreateBatch] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [adapterRefreshTrigger, setAdapterRefreshTrigger] = useState(0)

  // Storage usage
  const [storageUsage, setStorageUsage] = useState(getStorageUsage())

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Processing stats
  const [processingStats, setProcessingStats] = useState({ current: 0, total: 0 })

  // Load images from localStorage on mount
  useEffect(() => {
    const stored = getStoredImages()
    setImages(stored)
    setStorageUsage(getStorageUsage())
  }, [])

  // Load queue items from localStorage on mount
  useEffect(() => {
    const stored = getQueueItems()
    setQueueItems(stored)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentItems = view === 'queue' ? queueItems : view === 'library' ? images : []
      if (currentItems.length === 0) return

      // Ctrl+A / Cmd+A: Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && (view === 'queue' || view === 'library')) {
        e.preventDefault()
        setSelectionMode(true)
        setSelectedIds(currentItems.map(item => item.id))
      }

      // Escape: Clear selection / Exit selection mode
      if (e.key === 'Escape' && selectionMode) {
        setSelectionMode(false)
        setSelectedIds([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, queueItems, images, selectionMode])

  const handleAdapterChange = (newAdapter: AdapterType) => {
    setAdapter(newAdapter)
    const newModel = ADAPTER_MODELS[newAdapter][0]
    setModel(newModel)
    localStorage.setItem(STORAGE_KEYS.adapter, newAdapter)
    localStorage.setItem(STORAGE_KEYS.model, newModel)
  }

  const handleModelChange = (newModel: string) => {
    setModel(newModel)
    localStorage.setItem(STORAGE_KEYS.model, newModel)
  }

  // Supported image extensions (case-insensitive)
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.heic', '.heif', '.avif', '.svg']

  const isImageFile = (file: File): boolean => {
    if (file.type.startsWith('image/')) return true
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    return IMAGE_EXTENSIONS.includes(ext)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => isImageFile(f) || f.name.toLowerCase().endsWith('.zip')
      )
      if (files.length > 0) processImages(files)
    },
    [model]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        (f) => isImageFile(f) || f.name.toLowerCase().endsWith('.zip')
      )
      if (files.length > 0) processImages(files)
      e.target.value = ''
    },
    [model]
  )

  // Get the current adapter based on selection
  const getAdapter = () => {
    switch (adapter) {
      case 'openai':
        return openaiAdapter
      case 'claude':
        return claudeAdapter
      case 'google':
        return googleAdapter
      case 'ollama':
        return ollamaAdapter
      default:
        return mockAdapter
    }
  }

  // Add files to queue
  const processImages = async (files: File[]) => {
    const newItems: QueueItem[] = []
    for (const file of files) {
      try {
        const thumbnail = await createThumbnail(file)
        const queueItem = addToQueue({
          file,
          thumbnail,
          filename: file.name,
        })
        newItems.push(queueItem)
        setQueueItems((prev) => [...prev, queueItem])
      } catch (error) {
        console.error('Failed to create thumbnail:', error)
        setProcessingError(`Failed to add ${file.name} to queue`)
      }
    }

    // Auto-process if enabled
    if (autoProcess && newItems.length > 0) {
      setTimeout(() => handleProcessQueue(), 100)
    }
  }

  // Process queue items
  const handleProcessQueue = async () => {
    const pendingItems = queueItems.filter(item => item.status === 'pending')
    if (pendingItems.length === 0) return

    setIsProcessing(true)
    setProcessingError(null)
    setProcessingStats({ current: 0, total: pendingItems.length })
    const currentAdapter = getAdapter()
    console.log('[MetaLens] Processing queue with adapter:', adapter, '→', currentAdapter.name, 'model:', model)

    // Check if adapter requires API key and is configured
    if (!currentAdapter.isConfigured()) {
      setProcessingError(`${currentAdapter.name} requires an API key. Click "Configure" to add one.`)
      setIsProcessing(false)
      return
    }

    for (let i = 0; i < pendingItems.length; i++) {
      const queueItem = pendingItems[i]
      setProcessingStats({ current: i + 1, total: pendingItems.length })

      // Update status to processing
      updateQueueItem(queueItem.id, { status: 'processing' })
      setQueueItems((prev) => prev.map(item =>
        item.id === queueItem.id ? { ...item, status: 'processing' } : item
      ))

      try {
        // Analyze the image
        const result = await currentAdapter.analyze(queueItem.thumbnail, model)

        // Create stored image with analysis result
        const storedImage: StoredImage = {
          id: generateId(),
          filename: queueItem.filename,
          thumbnail: queueItem.thumbnail,
          addedAt: new Date().toISOString(),
          result,
        }

        // Add to library
        addImage(storedImage)
        setImages((prev) => [...prev, storedImage])

        // Mark queue item as complete
        updateQueueItem(queueItem.id, { status: 'complete' })
        setQueueItems((prev) => prev.map(item =>
          item.id === queueItem.id ? { ...item, status: 'complete' } : item
        ))

        // Remove from queue after successful processing
        setTimeout(() => {
          removeFromQueue(queueItem.id)
          setQueueItems((prev) => prev.filter(item => item.id !== queueItem.id))
        }, 1000)

      } catch (error) {
        console.error('Analysis error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        updateQueueItem(queueItem.id, {
          status: 'error',
          errorMessage
        })
        setQueueItems((prev) => prev.map(item =>
          item.id === queueItem.id ? { ...item, status: 'error', errorMessage } : item
        ))
        setProcessingError(`Analysis failed for ${queueItem.filename}: ${errorMessage}`)
      }
    }

    setIsProcessing(false)
    setStorageUsage(getStorageUsage())
  }

  const handleReanalyze = async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    setProcessingError(null)
    setProcessingStats({ current: 0, total: images.length })
    const currentAdapter = getAdapter()

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      setProcessingStats({ current: i + 1, total: images.length })
      setProcessingStatus((prev) => ({ ...prev, [img.id]: 'processing' }))
      try {
        const result = await currentAdapter.analyze(img.thumbnail, model)
        updateImage(img.id, { result })
        setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, result } : p)))
        setProcessingStatus((prev) => ({ ...prev, [img.id]: 'complete' }))
      } catch (error) {
        console.error('Re-analysis error:', error)
        setProcessingStatus((prev) => ({ ...prev, [img.id]: 'error' }))
      }
    }

    setIsProcessing(false)
  }

  const handleRemoveImage = (id: string) => {
    removeImage(id)
    setImages((prev) => prev.filter((img) => img.id !== id))
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
    if (selectedImage?.id === id) setSelectedImage(null)
    setStorageUsage(getStorageUsage())
  }

  const handleClearAll = () => {
    clearAllImages()
    setImages([])
    setProcessingStatus({})
    setSelectedImage(null)
    setSelectedIds([])
    setSelectionMode(false)
    setStorageUsage(getStorageUsage())
  }

  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)

  const handleSelectToggle = (id: string, event?: React.MouseEvent) => {
    const currentItems = view === 'queue' ? queueItems : images
    const currentIds = currentItems.map(item => item.id)

    // Shift+Click: Range select
    if (event?.shiftKey && lastSelectedId && selectionMode) {
      const lastIndex = currentIds.indexOf(lastSelectedId)
      const currentIndex = currentIds.indexOf(id)
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex)
        const end = Math.max(lastIndex, currentIndex)
        const rangeIds = currentIds.slice(start, end + 1)
        setSelectedIds((prev) => {
          const newSet = new Set([...prev, ...rangeIds])
          return Array.from(newSet)
        })
        return
      }
    }

    // Ctrl/Cmd+Click or normal selection mode: Toggle individual
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
    setLastSelectedId(id)
  }

  const handleSelectAll = () => {
    const currentItems = view === 'queue' ? queueItems : images
    setSelectionMode(true)
    setSelectedIds(currentItems.map(item => item.id))
  }

  const handleSelectNone = () => {
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    if (view === 'queue') {
      selectedIds.forEach(id => removeFromQueue(id))
      setQueueItems((prev) => prev.filter(item => !selectedIds.includes(item.id)))
    } else if (view === 'library') {
      selectedIds.forEach(id => {
        removeImage(id)
      })
      setImages((prev) => prev.filter(img => !selectedIds.includes(img.id)))
    }
    setSelectedIds([])
    setSelectionMode(false)
    setStorageUsage(getStorageUsage())
  }

  const handleBatchProcess = async () => {
    if (view === 'queue') {
      // Process selected queue items
      await handleProcessQueue()
    }
    setSelectedIds([])
    setSelectionMode(false)
  }

  const handleCreateBatch = (name: string) => {
    createBatch(name, selectedIds)
    setSelectedIds([])
    setSelectionMode(false)
    setImages(getStoredImages())
    setBatches(getBatches())
  }

  const handleRenameBatch = (id: string, name: string) => {
    renameBatch(id, name)
    setBatches(getBatches())
  }

  const handleDeleteBatch = (id: string) => {
    deleteBatch(id)
    setBatches(getBatches())
    setImages(getStoredImages())
  }

  const handleToggleBatchExpanded = (id: string) => {
    toggleBatchExpanded(id)
    setBatches(getBatches())
  }

  const getImageStatus = (id: string) => processingStatus[id] || 'complete'

  const hasResults = images.some((img) => img.result)
  const processingProgress = processingStats.total > 0
    ? (processingStats.current / processingStats.total) * 100
    : 0

  // Queue handlers
  const handleToggleAutoProcess = () => {
    const newValue = !autoProcess
    setAutoProcess(newValue)
    setAutoProcessQueue(newValue)
  }

  const handleClearQueue = () => {
    clearQueue()
    setQueueItems([])
  }

  const handleRemoveQueueItem = (id: string) => {
    removeFromQueue(id)
    setQueueItems((prev) => prev.filter(item => item.id !== id))
  }

  const handleRetryQueueItem = async (id: string) => {
    updateQueueItem(id, { status: 'pending', errorMessage: undefined })
    setQueueItems((prev) => prev.map(item =>
      item.id === id ? { ...item, status: 'pending' as const, errorMessage: undefined } : item
    ))
  }

  const queueStats = getQueueStats()

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* ===== TOP HEADER BAR (60px) ===== */}
      <header className="h-[60px] min-h-[60px] bg-card border-b border-border flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Scan className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-logo text-lg font-bold tracking-wide text-foreground">
              METALENS
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider">AI VISION ANALYSIS</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>{Math.round(storageUsage.percentage)}% storage</span>
          </div>
        </div>
      </header>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== ICON RAIL (48px) - Hidden on mobile ===== */}
        <div className="hidden md:flex w-12 bg-background border-r border-border flex-col items-center py-2">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setView('analyze')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'analyze'
                  ? 'bg-gold/20 text-gold'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="AI Vision Analysis"
            >
              <Wand2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('library')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'library'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="Image Library"
            >
              <Images className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('batches')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'batches'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="Batches"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('sketch')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'sketch'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="Sketch → Mermaid"
            >
              <PenTool className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowCamera(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-muted-foreground/60 hover:text-muted-foreground hover:bg-card"
              title="Capture Photo"
            >
              <Camera className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('faces')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'faces'
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="Face Recognition"
            >
              <Users className="h-5 w-5" />
            </button>
          </div>

          <div className="w-6 h-px bg-border my-2" />

          <div className="flex-1" />

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setView('settings')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                view === 'settings'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-card'
              )}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ===== EXPLORER PANEL (288px) - Hidden on mobile ===== */}
        <div className="hidden lg:flex w-72 bg-card border-r border-border flex-col">
          <div className="h-8 bg-muted border-b border-border flex items-center px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {view === 'analyze' && (
              <>
                <Wand2 className="h-3 w-3 mr-2" />
                Vision Analysis
              </>
            )}
            {view === 'library' && (
              <>
                <Images className="h-3 w-3 mr-2" />
                Library
              </>
            )}
            {view === 'batches' && (
              <>
                <FolderOpen className="h-3 w-3 mr-2" />
                Batches
              </>
            )}
            {view === 'faces' && (
              <>
                <Users className="h-3 w-3 mr-2" />
                Face Recognition
              </>
            )}
            {view === 'sketch' && (
              <>
                <PenTool className="h-3 w-3 mr-2" />
                Sketch
              </>
            )}
            {view === 'settings' && (
              <>
                <Settings className="h-3 w-3 mr-2" />
                Settings
              </>
            )}
          </div>

          <div className="flex-1 overflow-auto p-2">
            {view === 'analyze' && (
              <div className="space-y-1">
                <ExplorerButton
                  icon={Sparkles}
                  label="AI Engine"
                  badge={ADAPTERS[adapter].split(' ')[0]}
                />
                <ExplorerButton icon={FileJson} label="Export Options" />
                <ExplorerButton
                  icon={History}
                  label="Recent"
                  badge={images.length > 0 ? images.length : undefined}
                />
              </div>
            )}
            {view === 'library' && (
              <div className="space-y-1">
                {images.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No images yet
                  </p>
                ) : (
                  images.slice(0, 30).map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted',
                        selectedImage?.id === img.id && 'bg-muted'
                      )}
                    >
                      <img
                        src={img.thumbnail}
                        className="w-6 h-6 rounded object-cover"
                        alt=""
                      />
                      <span className="truncate flex-1 text-left text-muted-foreground">
                        {img.filename}
                      </span>
                      {img.result && (
                        <Eye className="h-3 w-3 text-green-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
            {view === 'batches' && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No batches yet
              </p>
            )}
            {view === 'sketch' && (
              <div className="space-y-1">
                <ExplorerButton icon={PenTool} label="New Sketch" />
                <ExplorerButton icon={FileJson} label="Mermaid Output" />
                <ExplorerButton icon={History} label="Recent" />
              </div>
            )}
            {view === 'faces' && (
              <div className="space-y-1">
                <ExplorerButton icon={Users} label="People" active />
                <ExplorerButton icon={AlertCircle} label="Unassigned" />
              </div>
            )}
            {view === 'settings' && (
              <div className="space-y-1">
                <ExplorerButton icon={Sparkles} label="AI Engines" active />
                <ExplorerButton icon={HardDrive} label="Storage" />
              </div>
            )}
          </div>

          <div className="bg-muted border-t border-border py-1.5 px-2 text-[10px] text-center text-muted-foreground">
            {APP_VERSION}
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-8 bg-muted border-b border-border flex items-center px-3 text-xs font-semibold text-muted-foreground">
            {view === 'analyze' && 'AI Vision Analysis'}
            {view === 'library' && `${images.length} Images`}
            {view === 'batches' && 'Batches'}
            {view === 'faces' && 'Face Recognition'}
            {view === 'sketch' && 'Sketch → Mermaid Diagram'}
            {view === 'settings' && 'Settings'}
          </div>

          <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
            {view === 'analyze' && (
              <div className="max-w-6xl mx-auto">
                {/* Pro Layout: Compact drop zone + settings side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  {/* Left: Compact Drop Zone */}
                  <Card
                  className={cn(
                    'relative border-2 border-dashed transition-all overflow-hidden',
                    isDragging
                      ? 'border-gold bg-gold/5'
                      : 'border-muted hover:border-gold/50'
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                  }}
                  onDrop={handleDrop}
                >
                  <div className="p-6 text-center">
                    {/* Compact Icon */}
                    <div className="mb-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {isProcessing ? (
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        ) : (
                          <Scan className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Compact Title */}
                    <h3 className="text-base font-semibold mb-1">
                      {isProcessing ? 'Processing...' : 'Drop Images'}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {isProcessing
                        ? `${processingStats.current}/${processingStats.total} images`
                        : 'Drag & drop or click to upload'}
                    </p>

                    {/* Compact Progress */}
                    {isProcessing && (
                      <div className="mb-4">
                        <Progress value={processingProgress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {Math.round(processingProgress)}%
                        </p>
                      </div>
                    )}

                    {/* Compact File Button */}
                    {!isProcessing && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.zip,.heic,.heif,.avif"
                          multiple
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          JPG, PNG, WebP, GIF, HEIC
                        </p>
                      </>
                    )}
                  </div>
                </Card>

                {/* Right: Settings Panel */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Engine Selector */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Engine
                      </h4>
                      <EngineSelector
                        adapter={adapter}
                        model={model}
                        onAdapterChange={handleAdapterChange}
                        onModelChange={handleModelChange}
                        onConfigureKey={setApiKeyDialogAdapter}
                        hasResults={false}
                        isProcessing={isProcessing}
                        refreshTrigger={adapterRefreshTrigger}
                      />
                    </div>

                    {/* Extraction Options */}
                    <div className="space-y-2 pt-3 border-t border-border">
                      <h4 className="text-sm font-semibold">Extraction Options</h4>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span>Tags & Keywords</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span>Colors & Palette</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span>Objects & Scene</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Faces & People</span>
                          <Badge variant="secondary" className="ml-auto text-[10px]">Pro</Badge>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Text & OCR</span>
                          <Badge variant="secondary" className="ml-auto text-[10px]">Pro</Badge>
                        </label>
                      </div>
                    </div>

                    {/* Auto Process */}
                    <div className="pt-3 border-t border-border">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium">Auto-process queue</span>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={autoProcess}
                          onChange={handleToggleAutoProcess}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically process images as they're added to queue
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Error Message - Full Width Below */}
              {processingError && (
                <div className="max-w-6xl mx-auto mb-4">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{processingError}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 px-2"
                      onClick={() => setProcessingError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Images - Full Width Below */}
              {images.length > 0 && !isProcessing && (
                <Card className="max-w-6xl mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">
                        Recent ({images.length})
                      </span>
                      <div className="flex items-center gap-2">
                        {hasResults && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReanalyze}
                            className="h-7 text-xs gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Re-analyze
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAll}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.slice(0, 12).map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(img)}
                          className={cn(
                            'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                            selectedImage?.id === img.id
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-transparent hover:border-muted-foreground/50'
                          )}
                        >
                          <img
                            src={img.thumbnail}
                            alt={img.filename}
                            className="w-full h-full object-cover"
                          />
                          {getImageStatus(img.id) === 'processing' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 text-white animate-spin" />
                            </div>
                          )}
                          {getImageStatus(img.id) === 'error' && (
                            <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {img.result && getImageStatus(img.id) !== 'processing' && (
                            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-background" />
                          )}
                        </button>
                      ))}
                      {images.length > 12 && (
                        <button
                          onClick={() => setView('library')}
                          className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground hover:bg-muted-foreground/20"
                        >
                          +{images.length - 12}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
                {/* Processing Queue */}
                {queueItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold">Processing Queue</h3>
                        <p className="text-xs text-muted-foreground">
                          {queueStats.pending} pending, {queueStats.processing} processing, {queueStats.error} failed
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {queueStats.pending > 0 && !autoProcess && !isProcessing && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleProcessQueue}
                            className="gap-2"
                          >
                            <Wand2 className="h-4 w-4" />
                            Process ({queueStats.pending})
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearQueue}
                          className="text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {queueItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-lg overflow-hidden bg-secondary"
                          title={item.filename}
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.filename}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          {/* Status badge */}
                          <div className="absolute top-1.5 left-1.5">
                            {item.status === 'processing' && (
                              <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0.5">
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              </Badge>
                            )}
                            {item.status === 'error' && (
                              <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0.5">
                                <AlertCircle className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                          </div>

                          {/* Remove/Retry button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (item.status === 'error') {
                                handleRetryQueueItem(item.id)
                              } else {
                                handleRemoveQueueItem(item.id)
                              }
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity"
                            title={item.status === 'error' ? 'Retry' : 'Remove'}
                          >
                            {item.status === 'error' ? (
                              <RefreshCw className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Library */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Recent Library</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('library')}
                        className="text-xs"
                      >
                        View All ({images.length})
                      </Button>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {images.slice(0, 12).map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img)}
                          className="relative aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title={img.filename}
                        >
                          <img
                            src={img.thumbnail}
                            alt={img.filename}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {images.length > 12 && (
                        <button
                          onClick={() => setView('library')}
                          className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground hover:bg-muted-foreground/20"
                        >
                          +{images.length - 12}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'library' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{images.length} Images</h2>
                    <p className="text-sm text-muted-foreground">
                      All analyzed images in your library
                    </p>
                  </div>
                  {images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportMetadataJSON(images)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export JSON
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Library
                      </Button>
                    </div>
                  )}
                </div>

                {images.length > 0 ? (
                  <ThumbnailGrid
                    images={images}
                    selectedIds={selectedIds}
                    selectionMode={selectionMode}
                    onSelectToggle={handleSelectToggle}
                    onSelectionModeChange={setSelectionMode}
                    onImageClick={setSelectedImage}
                    onRemoveImage={handleRemoveImage}
                    onCreateBatch={() => setShowCreateBatch(true)}
                    getImageStatus={getImageStatus}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Images className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No images yet</p>
                      <Button className="mt-4" onClick={() => setView('analyze')}>
                        Analyze Images
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {view === 'batches' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Batches ({batches.length})</h2>
                    <p className="text-sm text-muted-foreground">
                      Organize images into groups
                    </p>
                  </div>
                </div>

                {batches.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No batches yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select images in the library and create a batch
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {batches.map((batch) => (
                      <BatchCard
                        key={batch.id}
                        batch={batch}
                        imageCount={batch.imageIds.length}
                        onToggleExpanded={() => handleToggleBatchExpanded(batch.id)}
                        onRename={(name) => handleRenameBatch(batch.id, name)}
                        onDelete={() => handleDeleteBatch(batch.id)}
                        onViewImages={() => {
                          setView('library')
                          // TODO: Filter library by batch
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'sketch' && <SketchPage adapter={getAdapter()} model={model} />}

            {view === 'faces' && <FacesPage />}

            {view === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure AI engines and preferences
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <EngineSelector
                      adapter={adapter}
                      model={model}
                      onAdapterChange={handleAdapterChange}
                      onModelChange={handleModelChange}
                      onConfigureKey={setApiKeyDialogAdapter}
                      hasResults={false}
                      isProcessing={false}
                      refreshTrigger={adapterRefreshTrigger}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Selected Image Detail Panel */}
          {selectedImage && selectedImage.result && (
            <ImageDetailPanel
              image={selectedImage}
              adapter={getAdapter()}
              model={model}
              onClose={() => setSelectedImage(null)}
              onUpdate={(updated) => {
                setSelectedImage(updated)
                setImages((prev) =>
                  prev.map((img) => (img.id === updated.id ? updated : img))
                )
              }}
            />
          )}
        </div>
      </div>

      {/* ===== FOOTER STATUS BAR (24px) ===== */}
      <footer className="h-6 bg-card border-t border-border flex items-center px-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3 w-3" />
            <span>main</span>
          </div>
          <span className="text-border">|</span>
          <span>{images.length} images</span>
          <span className="text-border">|</span>
          <span>{ADAPTERS[adapter].split(' ')[0]} engine</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`MetaLens ${APP_VERSION}`)
            }}
            className="hover:text-foreground flex items-center gap-1.5 transition-colors"
            title="Click to copy version info"
          >
            <span>MetaLens {APP_VERSION}</span>
            <Info className="h-3 w-3" />
          </button>
        </div>
      </footer>

      {/* Dialogs */}
      <ApiKeyDialog
        adapter={apiKeyDialogAdapter}
        open={!!apiKeyDialogAdapter}
        onOpenChange={(open) => !open && setApiKeyDialogAdapter(null)}
        onSaved={() => {
          setApiKeyDialogAdapter(null)
          setAdapterRefreshTrigger(prev => prev + 1)
        }}
      />

      <CreateBatchDialog
        open={showCreateBatch}
        onOpenChange={setShowCreateBatch}
        imageCount={selectedIds.length}
        onCreateBatch={handleCreateBatch}
      />

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            processImages([file])
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around py-2 px-2 z-40">
        <button
          onClick={() => setView('analyze')}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
            view === 'analyze' ? 'bg-gold/20 text-gold' : 'text-muted-foreground'
          )}
        >
          <Wand2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Analyze</span>
        </button>
        <button
          onClick={() => setView('library')}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
            view === 'library' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground'
          )}
        >
          <Images className="h-5 w-5" />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button
          onClick={() => setView('faces')}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
            view === 'faces' ? 'bg-pink-500/20 text-pink-400' : 'text-muted-foreground'
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Faces</span>
        </button>
        <button
          onClick={() => setShowCamera(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground"
        >
          <Camera className="h-5 w-5" />
          <span className="text-[10px] font-medium">Camera</span>
        </button>
        <button
          onClick={() => setView('settings')}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
            view === 'settings' ? 'bg-muted text-foreground' : 'text-muted-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default App

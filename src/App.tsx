import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, Badge, Progress, Button, cn } from '@covers/ui'
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
} from 'lucide-react'
import { AdapterType, ADAPTER_MODELS, ADAPTERS, mockAdapter, ollamaAdapter, openaiAdapter, claudeAdapter, googleAdapter } from './lib/adapters'
import { EngineSelector } from './components/EngineSelector'
import { ApiKeyDialog } from './components/ApiKeyDialog'
import { ThumbnailGrid } from './components/ThumbnailGrid'
import { CreateBatchDialog } from './components/CreateBatchDialog'
import { ImageDetailPanel } from './components/ImageDetailPanel'
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
} from './lib/storage'

type ProcessingStatus = Record<string, 'pending' | 'processing' | 'complete' | 'error'>
type View = 'analyze' | 'library' | 'batches' | 'sketch' | 'settings'

// Version with Swedish timestamp
const APP_VERSION = 'v1.0.0 (2026-02-10 11:15 CET)'

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

  // Selection mode for batching
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialogs
  const [apiKeyDialogAdapter, setApiKeyDialogAdapter] = useState<AdapterType | null>(null)
  const [showCreateBatch, setShowCreateBatch] = useState(false)
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

  const processImages = async (files: File[]) => {
    setIsProcessing(true)
    setProcessingError(null)
    setProcessingStats({ current: 0, total: files.length })
    const currentAdapter = getAdapter()
    console.log('[MetaLens] Using adapter:', adapter, '→', currentAdapter.name, 'model:', model)

    // Check if adapter requires API key and is configured
    if (!currentAdapter.isConfigured()) {
      setProcessingError(`${currentAdapter.name} requires an API key. Click "Configure" to add one.`)
      setIsProcessing(false)
      return
    }

    const newImages: StoredImage[] = []
    for (const file of files) {
      try {
        const thumbnail = await createThumbnail(file)
        const storedImage: StoredImage = {
          id: generateId(),
          filename: file.name,
          thumbnail,
          addedAt: new Date().toISOString(),
        }
        addImage(storedImage)
        newImages.push(storedImage)
        setProcessingStatus((prev) => ({ ...prev, [storedImage.id]: 'pending' }))
      } catch (error) {
        console.error('Failed to create thumbnail:', error)
        setProcessingError(`Failed to process ${file.name}`)
      }
    }

    setImages((prev) => [...prev, ...newImages])

    for (let i = 0; i < newImages.length; i++) {
      const img = newImages[i]
      setProcessingStats({ current: i + 1, total: newImages.length })
      setProcessingStatus((prev) => ({ ...prev, [img.id]: 'processing' }))

      try {
        const result = await currentAdapter.analyze(files[i], model)
        updateImage(img.id, { result })
        setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, result } : p)))
        setProcessingStatus((prev) => ({ ...prev, [img.id]: 'complete' }))
      } catch (error) {
        console.error('Analysis error:', error)
        setProcessingStatus((prev) => ({ ...prev, [img.id]: 'error' }))
        setProcessingError(`Analysis failed for ${img.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const handleCreateBatch = (name: string) => {
    createBatch(name, selectedIds)
    setSelectedIds([])
    setSelectionMode(false)
    setImages(getStoredImages())
  }

  const getImageStatus = (id: string) => processingStatus[id] || 'complete'

  const hasResults = images.some((img) => img.result)
  const processingProgress = processingStats.total > 0
    ? (processingStats.current / processingStats.total) * 100
    : 0

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* ===== TOP HEADER BAR (60px) ===== */}
      <header className="h-[60px] min-h-[60px] bg-card border-b border-border flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gold/20 flex items-center justify-center">
            <Scan className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">MetaLens</h1>
            <p className="text-xs text-muted-foreground">AI Vision Analysis</p>
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
        {/* ===== ICON RAIL (48px) ===== */}
        <div className="w-12 bg-background border-r border-border flex flex-col items-center py-2">
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

        {/* ===== EXPLORER PANEL (288px) ===== */}
        <div className="w-72 bg-card border-r border-border flex flex-col">
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
            {view === 'sketch' && 'Sketch → Mermaid Diagram'}
            {view === 'settings' && 'Settings'}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {view === 'analyze' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Main Drop Zone Card */}
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
                  <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                        {isProcessing ? (
                          <Loader2 className="h-8 w-8 text-gold animate-spin" />
                        ) : (
                          <Scan className="h-8 w-8 text-gold" />
                        )}
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-xl font-semibold mb-1">
                      {isProcessing ? 'Analyzing...' : 'Drop images to analyze'}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      {isProcessing
                        ? `Processing ${processingStats.current} of ${processingStats.total} images`
                        : 'AI extracts metadata, tags, colors, objects & more'}
                    </p>

                    {/* Progress Bar (inside drop zone) */}
                    {isProcessing && (
                      <div className="max-w-xs mx-auto mb-6">
                        <Progress value={processingProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round(processingProgress)}% complete
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {processingError && (
                      <div className="max-w-md mx-auto mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
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
                    )}

                    {/* File Input Button */}
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
                          size="lg"
                          onClick={() => fileInputRef.current?.click()}
                          className="mb-4"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Choose Files
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, WebP, GIF, HEIC, AVIF, SVG, or ZIP
                        </p>
                      </>
                    )}
                  </div>

                  {/* Recent Images Strip (inside card) */}
                  {images.length > 0 && !isProcessing && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
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
                        {images.slice(0, 8).map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className={cn(
                              'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                              selectedImage?.id === img.id
                                ? 'border-gold'
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
                              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border border-background" />
                            )}
                          </button>
                        ))}
                        {images.length > 8 && (
                          <button
                            onClick={() => setView('library')}
                            className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground hover:bg-muted-foreground/20"
                          >
                            +{images.length - 8}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Engine Selector (collapsible/secondary) */}
                <Card>
                  <CardContent className="pt-6">
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
                  </CardContent>
                </Card>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Library
                    </Button>
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
                <div>
                  <h2 className="text-lg font-semibold">Batches</h2>
                  <p className="text-sm text-muted-foreground">
                    Organize images into groups
                  </p>
                </div>
                <Card>
                  <CardContent className="py-12 text-center">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No batches yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select images in the library and create a batch
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {view === 'sketch' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Sketch → Mermaid Diagram</h2>
                  <p className="text-sm text-muted-foreground">
                    Draw flowcharts by hand, get Mermaid code instantly
                  </p>
                </div>
                <Card>
                  <CardContent className="py-12 text-center">
                    <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Coming Soon</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sketch shapes → AI recognizes → Mermaid code
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      In Development
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}

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
    </div>
  )
}

export default App

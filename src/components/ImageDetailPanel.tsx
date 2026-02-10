import { useState } from 'react'
import { Button, Badge, Input } from '@/ui-lib'
import {
  X,
  Copy,
  Check,
  Search,
  Globe,
  ImageIcon,
  Palette,
  Tag,
  FileText,
  Sparkles,
} from 'lucide-react'
import { StoredImage, updateImage } from '../lib/storage'
import { VisionAdapter } from '../lib/adapters'
import { TagPill, AddTagButton } from './TagPill'
import { ImageChat } from './ImageChat'

interface ImageDetailPanelProps {
  image: StoredImage
  adapter: VisionAdapter
  model: string
  onClose: () => void
  onUpdate: (image: StoredImage) => void
}

export function ImageDetailPanel({
  image,
  adapter,
  model,
  onClose,
  onUpdate,
}: ImageDetailPanelProps) {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [copied, setCopied] = useState(false)

  const result = image.result
  if (!result) return null

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = result.tags.filter((t) => t !== tagToRemove)
    const newResult = { ...result, tags: newTags }
    updateImage(image.id, { result: newResult })
    onUpdate({ ...image, result: newResult })
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    const newTags = [...result.tags, newTag.trim()]
    const newResult = { ...result, tags: newTags }
    updateImage(image.id, { result: newResult })
    onUpdate({ ...image, result: newResult })
    setNewTag('')
    setIsAddingTag(false)
  }

  const handleCopyAll = async () => {
    const data = {
      filename: image.filename,
      title: result.suggestedTitle,
      description: result.description,
      tags: result.tags,
      objects: result.objects,
      colors: result.colors,
      mood: result.mood,
      scene: result.scene,
    }
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const searchGoogle = (query: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, '_blank')
  }

  const searchPublicDomain = (query: string) => {
    window.open(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, '_blank')
  }

  return (
    <div className="border-t border-border bg-card">
      {/* Header with close */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{result.suggestedTitle}</h3>
            <p className="text-xs text-muted-foreground">{image.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-[140px_1fr] gap-6">
          {/* Image Preview */}
          <div className="space-y-3">
            <img
              src={image.thumbnail}
              alt={image.filename}
              className="w-full aspect-square rounded-lg object-cover border border-border"
            />
            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => searchGoogle(result.tags.join(' '))}
              >
                <Search className="h-3 w-3" />
                Google Images
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => searchPublicDomain(result.tags.slice(0, 3).join(' '))}
              >
                <Globe className="h-3 w-3" />
                Find on Unsplash
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm leading-relaxed">{result.description}</p>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Tag className="h-4 w-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, i) => (
                  <TagPill
                    key={i}
                    tag={tag}
                    onRemove={() => handleRemoveTag(tag)}
                    onSearch={() => searchGoogle(tag)}
                  />
                ))}
                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="New tag..."
                      className="h-8 w-32 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={handleAddTag}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingTag(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <AddTagButton onClick={() => setIsAddingTag(true)} />
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Palette className="h-4 w-4" />
                Colors
              </div>
              <div className="flex flex-wrap gap-3">
                {result.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <div
                      className="w-6 h-6 rounded-md border border-border shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{color.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {color.hex} · {color.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Objects */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <ImageIcon className="h-4 w-4" />
                Detected Objects
              </div>
              <div className="flex flex-wrap gap-2">
                {result.objects.map((obj, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-sm py-1 px-3"
                  >
                    {obj.name}
                    <span className="ml-1.5 text-muted-foreground">
                      {Math.round(obj.confidence * 100)}%
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mood & Scene - simple metadata, not pills */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Mood</span>
                <span className="text-sm font-medium capitalize">{result.mood}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Scene</span>
                <span className="text-sm font-medium capitalize">{result.scene}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <ImageChat
            image={image}
            adapter={adapter}
            model={model}
            onMetadataUpdate={(updates) => {
              const newResult = { ...result, ...updates }
              updateImage(image.id, { result: newResult })
              onUpdate({ ...image, result: newResult })
            }}
            onChatHistoryUpdate={(history) => {
              updateImage(image.id, { chatHistory: history })
              onUpdate({ ...image, chatHistory: history })
            }}
          />
        </div>
      </div>
    </div>
  )
}

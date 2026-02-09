import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  cn,
} from '@covers/ui'
import { Send, Loader2, MessageCircle, Sparkles } from 'lucide-react'
import { StoredImage } from '../lib/storage'
import { ChatMessage, AnalysisResult, VisionAdapter } from '../lib/adapters'

interface ImageChatProps {
  image: StoredImage
  adapter: VisionAdapter
  model: string
  onMetadataUpdate?: (updates: Partial<AnalysisResult>) => void
  onChatHistoryUpdate?: (history: ChatMessage[]) => void
}

export function ImageChat({
  image,
  adapter,
  model,
  onMetadataUpdate,
  onChatHistoryUpdate,
}: ImageChatProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(image.chatHistory || [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSend = async () => {
    if (!message.trim() || isLoading || !adapter.chat || !image.result) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }

    const newHistory = [...chatHistory, userMessage]
    setChatHistory(newHistory)
    setMessage('')
    setIsLoading(true)

    try {
      const response = await adapter.chat(
        image.thumbnail,
        image.result,
        userMessage.content,
        chatHistory,
        model
      )

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      }

      const finalHistory = [...newHistory, assistantMessage]
      setChatHistory(finalHistory)
      onChatHistoryUpdate?.(finalHistory)

      // If metadata was updated, notify parent
      if (response.updatedMetadata) {
        onMetadataUpdate?.(response.updatedMetadata)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
      }
      const finalHistory = [...newHistory, errorMessage]
      setChatHistory(finalHistory)
      onChatHistoryUpdate?.(finalHistory)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!adapter.chat) {
    return (
      <Card className="mt-4">
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Chat not available for this adapter
        </CardContent>
      </Card>
    )
  }

  if (!image.result) {
    return (
      <Card className="mt-4">
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Analyze the image first to start chatting
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat about this image
          {chatHistory.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {chatHistory.length} messages
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {/* Chat messages */}
        {chatHistory.length > 0 && (
          <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'text-sm rounded-lg px-3 py-2',
                  msg.role === 'user'
                    ? 'bg-primary/20 text-foreground ml-8'
                    : 'bg-muted mr-8'
                )}
              >
                <div className="text-[10px] text-muted-foreground mb-1">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted rounded-lg px-3 py-2 mr-8">
                <div className="text-[10px] text-muted-foreground mb-1">AI</div>
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about this image..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="default"
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggestions */}
        {chatHistory.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'What objects are in this image?',
              'Add more tags',
              'Change the title',
              'Describe the colors',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setMessage(suggestion)}
                className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

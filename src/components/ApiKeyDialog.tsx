import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Badge,
} from '@covers/ui'
import { ExternalLink, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { AdapterType, ADAPTERS } from '../lib/adapters'
import {
  getAdapterInfo,
  getApiKeys,
  saveApiKey,
  removeApiKey,
  getOllamaUrl,
  setOllamaUrl,
} from '../lib/adapters/state'

// API cost estimates per image
const API_COSTS: Record<string, string> = {
  openai: '~$0.01-0.03',
  claude: '~$0.01-0.04',
  google: '~$0.001-0.002',
}

interface ApiKeyDialogProps {
  adapter: AdapterType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function ApiKeyDialog({
  adapter,
  open,
  onOpenChange,
  onSaved,
}: ApiKeyDialogProps) {
  const [value, setValue] = useState('')
  const [showKey, setShowKey] = useState(false)

  const info = adapter ? getAdapterInfo(adapter) : null
  const isPaidApi = adapter && ['openai', 'claude', 'google'].includes(adapter)

  useEffect(() => {
    if (open && adapter) {
      if (adapter === 'ollama') {
        setValue(getOllamaUrl())
      } else {
        const keys = getApiKeys()
        setValue(keys[adapter] || '')
      }
    }
  }, [open, adapter])

  const handleSave = () => {
    if (!adapter) return

    if (adapter === 'ollama') {
      setOllamaUrl(value || 'http://localhost:11434')
    } else if (value.trim()) {
      saveApiKey(adapter, value.trim())
    }

    onSaved?.()
    onOpenChange(false)
  }

  const handleRemove = () => {
    if (!adapter) return

    if (adapter === 'ollama') {
      setOllamaUrl('http://localhost:11434')
    } else {
      removeApiKey(adapter)
    }

    setValue('')
    onSaved?.()
    onOpenChange(false)
  }

  if (!adapter || !info) return null

  const isOllama = adapter === 'ollama'
  const title = isOllama ? 'Configure Ollama' : `Configure ${ADAPTERS[adapter]}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isOllama ? (
              <>
                Enter your Ollama server URL. Make sure Ollama is running locally
                or accessible via tunnel.
              </>
            ) : (
              <>
                Enter your API key to enable {ADAPTERS[adapter]}. Your key is stored
                locally in your browser.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">
              {isOllama ? 'Server URL' : info.keyName}
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey || isOllama ? 'text' : 'password'}
                placeholder={info.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pr-10"
              />
              {!isOllama && (
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {isPaidApi && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-500">API Cost</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {ADAPTERS[adapter]} costs {API_COSTS[adapter]} per image.
                    Keys are stored in browser localStorage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {info.helpUrl && (
            <a
              href={info.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              {isOllama ? 'Install Ollama' : 'Get an API key'}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {isOllama && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Quick setup:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Install Ollama from ollama.ai</li>
                <li>Run: <code className="bg-secondary px-1 rounded">ollama pull llava</code></li>
                <li>Start server: <code className="bg-secondary px-1 rounded">ollama serve</code></li>
              </ol>
              <Badge variant="outline" className="mt-2">Free - runs locally</Badge>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {value && (
            <Button variant="ghost" onClick={handleRemove} className="text-destructive">
              Clear Key
            </Button>
          )}
          <Button onClick={handleSave}>
            {isOllama ? 'Save URL' : 'Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

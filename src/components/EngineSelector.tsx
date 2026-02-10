import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Button,
  Input,
  cn,
} from '@/ui-lib'
import { Check, AlertCircle, Loader2, Key, RefreshCw, Server, Globe } from 'lucide-react'
import { ADAPTERS, ADAPTER_MODELS, AdapterType } from '../lib/adapters'
import {
  AdapterStates,
  getAdapterStates,
  checkOllamaHealth,
  getAdapterInfo,
  getOllamaUrl,
  setOllamaUrl,
} from '../lib/adapters/state'

interface EngineSelectorProps {
  adapter: AdapterType
  model: string
  onAdapterChange: (adapter: AdapterType) => void
  onModelChange: (model: string) => void
  onReanalyze?: () => void
  onConfigureKey?: (adapter: AdapterType) => void
  hasResults?: boolean
  isProcessing?: boolean
  refreshTrigger?: number // Increment to force state refresh
}

export function EngineSelector({
  adapter,
  model,
  onAdapterChange,
  onModelChange,
  onReanalyze,
  onConfigureKey,
  hasResults = false,
  isProcessing = false,
  refreshTrigger = 0,
}: EngineSelectorProps) {
  const [states, setStates] = useState<AdapterStates>(getAdapterStates())
  const [checkingOllama, setCheckingOllama] = useState(false)
  const [ollamaUrl, setOllamaUrlState] = useState(getOllamaUrl())
  const [showOllamaConfig, setShowOllamaConfig] = useState(false)
  const models = ADAPTER_MODELS[adapter]

  // Refresh states when refreshTrigger changes (e.g., after API key saved)
  useEffect(() => {
    setStates(getAdapterStates())
  }, [refreshTrigger])

  // Check Ollama health on mount and when switching to Ollama
  useEffect(() => {
    const checkOllama = async () => {
      setCheckingOllama(true)
      const isHealthy = await checkOllamaHealth()
      setStates(prev => ({
        ...prev,
        ollama: { configured: isHealthy, checking: false },
      }))
      setCheckingOllama(false)
    }

    checkOllama()
  }, [])

  const refreshStates = async () => {
    setStates(getAdapterStates())
    setCheckingOllama(true)
    const isHealthy = await checkOllamaHealth()
    setStates(prev => ({
      ...prev,
      ollama: { configured: isHealthy },
    }))
    setCheckingOllama(false)
  }

  const handleSaveOllamaUrl = async () => {
    setOllamaUrl(ollamaUrl)
    setCheckingOllama(true)
    const isHealthy = await checkOllamaHealth()
    setStates(prev => ({
      ...prev,
      ollama: { configured: isHealthy },
    }))
    setCheckingOllama(false)
    if (isHealthy) {
      setShowOllamaConfig(false)
    }
  }

  const handleAdapterChange = (newAdapter: AdapterType) => {
    onAdapterChange(newAdapter)
    onModelChange(ADAPTER_MODELS[newAdapter][0])
  }

  const getStatusIcon = (adapterKey: AdapterType) => {
    const state = states[adapterKey]
    if (adapterKey === 'ollama' && checkingOllama) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
    }
    if (state?.configured) {
      return <Check className="h-3 w-3 text-green-500" />
    }
    return <AlertCircle className="h-3 w-3 text-muted-foreground" />
  }

  const getStatusText = (adapterKey: AdapterType): string => {
    const state = states[adapterKey]
    const info = getAdapterInfo(adapterKey)

    if (adapterKey === 'mock') return 'Always available'
    if (adapterKey === 'ollama') {
      if (checkingOllama) return 'Checking...'
      return state?.configured ? 'Connected' : 'Not running'
    }
    if (!info.requiresKey) return ''
    return state?.configured ? 'Configured' : 'API key needed'
  }

  const currentState = states[adapter]
  const isConfigured = currentState?.configured ?? false

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Adapter Select */}
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">
            Vision Provider
          </label>
          <Select
            value={adapter}
            onValueChange={(v) => handleAdapterChange(v as AdapterType)}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select adapter" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ADAPTERS) as [AdapterType, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(key)}
                    <span>{label}</span>
                    {!states[key]?.configured && key !== 'mock' && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({getStatusText(key)})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select */}
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">
            Model
          </label>
          <Select
            value={model}
            onValueChange={onModelChange}
            disabled={isProcessing || !isConfigured}
          >
            <SelectTrigger className={cn(!isConfigured && 'opacity-50')}>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status & Actions Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <Badge
            variant={isConfigured ? 'default' : 'secondary'}
            className={cn(
              'gap-1',
              isConfigured ? 'bg-green-600/20 text-green-400 border-green-600/30' : ''
            )}
          >
            {getStatusIcon(adapter)}
            {getStatusText(adapter)}
          </Badge>

          {/* Configure Key Button */}
          {!isConfigured && adapter !== 'mock' && adapter !== 'ollama' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigureKey?.(adapter)}
              className="gap-1"
            >
              <Key className="h-3 w-3" />
              Add API Key
            </Button>
          )}

          {/* Ollama URL Config Button */}
          {adapter === 'ollama' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOllamaConfig(!showOllamaConfig)}
              className="gap-1"
            >
              <Globe className="h-3 w-3" />
              {showOllamaConfig ? 'Hide' : 'Configure URL'}
            </Button>
          )}

          {/* Refresh button for Ollama */}
          {adapter === 'ollama' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStates}
              disabled={checkingOllama}
            >
              <RefreshCw className={cn('h-3 w-3', checkingOllama && 'animate-spin')} />
            </Button>
          )}
        </div>

        {/* Re-analyze Button */}
        {hasResults && isConfigured && (
          <Button
            variant="default"
            size="sm"
            onClick={onReanalyze}
            disabled={isProcessing}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', isProcessing && 'animate-spin')} />
            Re-analyze with {ADAPTERS[adapter]}
          </Button>
        )}
      </div>

      {/* Ollama URL Configuration Panel */}
      {adapter === 'ollama' && showOllamaConfig && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Server className="h-4 w-4" />
            Ollama Server URL
          </div>
          <p className="text-xs text-muted-foreground">
            For remote access, use a Cloudflare Tunnel or ngrok URL.
            Local: <code className="px-1 py-0.5 bg-muted rounded">http://localhost:11434</code>
          </p>
          <div className="flex gap-2">
            <Input
              value={ollamaUrl}
              onChange={(e) => setOllamaUrlState(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1"
            />
            <Button
              variant="default"
              onClick={handleSaveOllamaUrl}
              disabled={checkingOllama}
            >
              {checkingOllama ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save & Test'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current: <code className="px-1 py-0.5 bg-muted rounded">{getOllamaUrl()}</code>
          </p>
        </div>
      )}
    </div>
  )
}

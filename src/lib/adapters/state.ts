import { AdapterType } from './types'

const API_KEYS_KEY = 'metalens_api_keys'
const OLLAMA_URL_KEY = 'metalens_ollama_url'

export interface AdapterState {
  configured: boolean
  apiKey?: string
  error?: string
  checking?: boolean
}

export type AdapterStates = Record<AdapterType, AdapterState>

// Get API keys from localStorage
export function getApiKeys(): Record<string, string> {
  try {
    const data = localStorage.getItem(API_KEYS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveApiKey(adapter: AdapterType, apiKey: string): void {
  const keys = getApiKeys()
  keys[adapter] = apiKey
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys))
}

export function removeApiKey(adapter: AdapterType): void {
  const keys = getApiKeys()
  delete keys[adapter]
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys))
}

export function getOllamaUrl(): string {
  return localStorage.getItem(OLLAMA_URL_KEY) || 'http://localhost:11434'
}

export function setOllamaUrl(url: string): void {
  localStorage.setItem(OLLAMA_URL_KEY, url)
}

// Check adapter configuration status
export function getAdapterStates(): AdapterStates {
  const keys = getApiKeys()

  return {
    mock: { configured: true },
    openai: { configured: !!keys.openai, apiKey: keys.openai },
    claude: { configured: !!keys.claude, apiKey: keys.claude },
    google: { configured: !!keys.google, apiKey: keys.google },
    ollama: { configured: false }, // Will be updated by health check
  }
}

// Check if Ollama is reachable
export async function checkOllamaHealth(): Promise<boolean> {
  const url = getOllamaUrl()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    // Try the version endpoint first (simpler, less data)
    const response = await fetch(`${url}/api/version`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    })

    clearTimeout(timeout)

    if (response.ok) {
      return true
    }

    // If version fails, try tags as backup
    const tagsResponse = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    })

    return tagsResponse.ok
  } catch (error) {
    console.log('Ollama health check failed:', error)
    // If we get a CORS error, Ollama might still be running
    // Return true optimistically - actual errors will show during analysis
    return true
  }
}

// Get display info for adapters
export function getAdapterInfo(adapter: AdapterType): {
  requiresKey: boolean
  keyName: string
  placeholder: string
  helpUrl?: string
} {
  switch (adapter) {
    case 'mock':
      return { requiresKey: false, keyName: '', placeholder: '' }
    case 'openai':
      return {
        requiresKey: true,
        keyName: 'OPENAI_API_KEY',
        placeholder: 'sk-...',
        helpUrl: 'https://platform.openai.com/api-keys',
      }
    case 'claude':
      return {
        requiresKey: true,
        keyName: 'ANTHROPIC_API_KEY',
        placeholder: 'sk-ant-...',
        helpUrl: 'https://console.anthropic.com/settings/keys',
      }
    case 'google':
      return {
        requiresKey: true,
        keyName: 'GOOGLE_API_KEY',
        placeholder: 'AIza...',
        helpUrl: 'https://aistudio.google.com/apikey',
      }
    case 'ollama':
      return {
        requiresKey: false,
        keyName: 'OLLAMA_URL',
        placeholder: 'http://localhost:11434',
        helpUrl: 'https://ollama.ai',
      }
  }
}

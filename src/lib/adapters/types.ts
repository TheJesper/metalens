export interface AnalysisResult {
  tags: string[]
  objects: Array<{ name: string; confidence: number }>
  colors: Array<{ hex: string; name: string; percentage: number }>
  mood: string
  scene: string
  description: string
  suggestedTitle: string
}

export interface VisionAdapter {
  name: string
  models: string[]
  analyze(image: File | string, model: string): Promise<AnalysisResult>
  isConfigured(): boolean
}

export const ADAPTERS = {
  mock: 'Mock (Demo)',
  openai: 'OpenAI Vision',
  claude: 'Claude Vision',
  google: 'Google Vision',
  ollama: 'Ollama (Local)',
} as const

export type AdapterType = keyof typeof ADAPTERS

export const ADAPTER_MODELS: Record<AdapterType, string[]> = {
  mock: ['demo-v1'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet-latest', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  ollama: ['llava', 'bakllava', 'llava-llama3'],
}

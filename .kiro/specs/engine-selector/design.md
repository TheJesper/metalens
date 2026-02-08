# Engine Selector - Design

## Component Structure
```
src/components/
├── EngineSelector.tsx      # Main selector component
├── AdapterCard.tsx         # Individual adapter option
└── ApiKeyDialog.tsx        # Key entry dialog
```

## Interface
```typescript
interface EngineSelectorProps {
  adapter: AdapterType
  model: string
  onAdapterChange: (adapter: AdapterType) => void
  onModelChange: (model: string) => void
  onReanalyze?: () => void
  hasResults?: boolean
  apiKeys: Record<string, string>
  onApiKeySet: (adapter: string, key: string) => void
}

interface AdapterState {
  id: AdapterType
  name: string
  enabled: boolean
  reason?: string  // "API Key Required" | "Server Unreachable"
  models: string[]
}
```

## Visual Design
```
┌─────────────────────────────────────┐
│ Vision Provider                     │
├─────────────────────────────────────┤
│ ✓ Mock (Demo)              [demo-v1]│
│ ✓ Ollama (Local)           [llava ▼]│
│ ○ OpenAI Vision    [API Key Required]│
│ ○ Claude Vision    [API Key Required]│
│ ○ Google Vision    [API Key Required]│
├─────────────────────────────────────┤
│ [Re-analyze 3 images with Ollama]   │
└─────────────────────────────────────┘
```

## State Management
- API keys stored in React state (session only)
- Adapter availability checked on mount
- Ollama health check: GET http://localhost:11434/api/tags

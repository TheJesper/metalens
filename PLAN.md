# MetaLens - Implementation Plan

## Current State (After Fixes)

| Item | Status |
|------|--------|
| Framework | Vite + React ✓ |
| UI Library | @covers/ui ✓ |
| Theme | CoverKit Azure Blue (#007ACC) ✓ |
| Port | 9550 ✓ |
| Peer deps | All Radix + utilities installed ✓ |

## Pending Tasks (Post-Compact)

### HIGH PRIORITY

#### 1. Re-Run Analysis on Engine Change
- When user switches adapter/model, offer to re-analyze existing images
- Button: "Re-analyze with {new engine}"
- Preserve original image references

#### 2. CoverKit Engine Selector
- Replace current basic Select with CoverKit-styled component
- Show adapter icons/logos
- Disabled state for unconfigured adapters
- Only Ollama enabled by default (no API key needed)
- OpenAI/Claude/Google show "API Key Required" disabled state

#### 3. Ollama Setup
- Ollama runs locally: `ollama serve` on port 11434
- Models: `ollama pull llava` or `ollama pull bakllava`
- Default URL: http://localhost:11434
- Support tunnel URLs for remote Ollama

#### 4. Image Thumbnails & Persistence
- Keep uploaded images as thumbnails after analysis
- Don't clear on new upload - accumulate
- "Clear All" button to reset
- Store image references in localStorage
- Re-render thumbnails on page reload

#### 5. Batch/Folder Grouping
- User can select multiple results → "Create Batch"
- Prompt for batch name
- Display as folder icon containing images
- Batches stored in localStorage
- Expand/collapse batch view

### MEDIUM PRIORITY

#### 6. Extract Components
- UploadZone.tsx
- ResultsGrid.tsx
- ResultCard.tsx
- EngineSelector.tsx
- BatchFolder.tsx

#### 7. Complete Adapter Implementation
- OpenAI adapter (needs API key UI)
- Claude adapter (needs API key UI)
- Google adapter (needs API key UI)
- API key storage (session only, never persist)

### Specs to Create
- `.kiro/specs/engine-selector/`
- `.kiro/specs/image-persistence/`
- `.kiro/specs/batch-grouping/`
- `.kiro/specs/rerun-analysis/`

## Ollama Quick Start
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start server
ollama serve

# Pull vision model
ollama pull llava

# Test
curl http://localhost:11434/api/tags
```

## File Structure Target
```
src/
├── components/
│   ├── UploadZone.tsx
│   ├── EngineSelector.tsx      # CoverKit styled
│   ├── ResultsGrid.tsx
│   ├── ResultCard.tsx
│   ├── BatchFolder.tsx
│   └── ApiKeyInput.tsx
├── lib/
│   ├── adapters/
│   ├── export.ts
│   ├── storage.ts              # localStorage utils
│   └── batches.ts              # Batch management
└── __tests__/
```

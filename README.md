# MetaLens

AI-powered image metadata extraction and analysis.

## Features

- **Multiple Vision Adapters**: OpenAI, Claude, Google Vision, or local Ollama
- **Automatic Analysis**: Tags, objects, colors, mood, scene description
- **Batch Processing**: Analyze multiple images at once
- **Local Storage**: Images persist in browser localStorage
- **B2B Interface**: Professional VSCode-style layout

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:9550

## Vision Providers

| Provider | Setup |
|----------|-------|
| Mock | No setup needed (demo) |
| Ollama | Run `ollama serve` locally |
| OpenAI | Add API key in settings |
| Claude | Add API key in settings |
| Google | Add API key in settings |

## Ollama (Local)

For local vision analysis without API costs:

```bash
# Install Ollama
# Pull a vision model
ollama pull llava:latest

# Start Ollama
ollama serve
```

MetaLens auto-detects available vision models.

## Tech Stack

- Vite + React + TypeScript
- CoverKit UI components
- Tailwind CSS
- Radix UI primitives

## License

MIT

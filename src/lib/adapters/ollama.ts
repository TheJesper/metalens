import { AnalysisResult, VisionAdapter, ChatMessage, ChatResponse } from './types'
import { getOllamaUrl } from './state'

// Convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (data:image/png;base64,)
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Check if Ollama is running
export const checkOllama = async (): Promise<boolean> => {
  const url = getOllamaUrl()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${url}/api/version`, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

// Get available vision models
export const getVisionModels = async (): Promise<string[]> => {
  const url = getOllamaUrl()
  try {
    const res = await fetch(`${url}/api/tags`)
    if (!res.ok) return []
    const data = await res.json()
    // Filter to vision-capable models
    const visionModels = ['llava', 'bakllava', 'llava-llama3', 'minicpm-v', 'llama3.2-vision']
    return (
      data.models
        ?.filter((m: { name: string }) =>
          visionModels.some((v) => m.name.includes(v))
        )
        .map((m: { name: string }) => m.name) || []
    )
  } catch {
    return []
  }
}

export const ollamaAdapter: VisionAdapter = {
  name: 'Ollama (Local)',
  models: ['llava:latest', 'llama3.2-vision:latest', 'minicpm-v:latest'],

  async analyze(image: File | string, model: string): Promise<AnalysisResult> {
    const url = getOllamaUrl()

    // Get base64 from File or use string directly (may be data URL)
    let imageBase64: string
    if (image instanceof File) {
      imageBase64 = await fileToBase64(image)
    } else if (image.startsWith('data:')) {
      // It's a data URL, extract base64
      imageBase64 = image.split(',')[1]
    } else {
      // Assume it's already base64
      imageBase64 = image
    }

    // Craft prompt for structured output
    const prompt = `Analyze this image and provide:
1. Tags: 5 keywords describing the image (comma-separated)
2. Objects: Main objects visible with confidence (0-1)
3. Colors: Dominant colors with hex codes and percentages
4. Mood: Single word mood/feeling
5. Scene: Brief scene description
6. Description: 1-2 sentence description
7. Suggested title: Creative title

Format as JSON:
{
  "tags": ["tag1", "tag2", ...],
  "objects": [{"name": "...", "confidence": 0.9}, ...],
  "colors": [{"hex": "#...", "name": "...", "percentage": 30}, ...],
  "mood": "...",
  "scene": "...",
  "description": "...",
  "suggestedTitle": "..."
}`

    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        images: [imageBase64],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    const data = await response.json()

    // Parse JSON from response (Ollama returns plain text)
    try {
      // Find JSON in response (may have text before/after)
      const jsonMatch = data.response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON in response')
      }
      const parsed = JSON.parse(jsonMatch[0])

      // Validate and normalize the response
      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['image'],
        objects: Array.isArray(parsed.objects)
          ? parsed.objects
          : [{ name: 'unknown', confidence: 0.5 }],
        colors: Array.isArray(parsed.colors)
          ? parsed.colors
          : [{ hex: '#888888', name: 'Gray', percentage: 100 }],
        mood: parsed.mood || 'neutral',
        scene: parsed.scene || 'unknown',
        description: parsed.description || data.response.slice(0, 200),
        suggestedTitle: parsed.suggestedTitle || 'Analyzed Image',
      }
    } catch (parseError) {
      // Fallback: extract what we can from text response
      console.warn('Failed to parse JSON, using fallback extraction:', parseError)
      return {
        tags: ['image', 'analyzed', 'local'],
        objects: [{ name: 'unknown', confidence: 0.5 }],
        colors: [{ hex: '#888888', name: 'Gray', percentage: 100 }],
        mood: 'neutral',
        scene: 'unknown',
        description: data.response?.slice(0, 200) || 'Analysis complete',
        suggestedTitle: 'Analyzed Image',
      }
    }
  },

  async chat(
    image: string,
    metadata: AnalysisResult,
    message: string,
    history: ChatMessage[],
    model: string
  ): Promise<ChatResponse> {
    const url = getOllamaUrl()

    // Extract base64 from data URL if needed
    const imageBase64 = image.startsWith('data:') ? image.split(',')[1] : image

    // Build context with metadata
    const metadataContext = `Current image metadata:
- Title: ${metadata.suggestedTitle}
- Description: ${metadata.description}
- Tags: ${metadata.tags.join(', ')}
- Objects: ${metadata.objects.map(o => `${o.name} (${Math.round(o.confidence * 100)}%)`).join(', ')}
- Colors: ${metadata.colors.map(c => `${c.name} (${c.percentage}%)`).join(', ')}
- Mood: ${metadata.mood}
- Scene: ${metadata.scene}`

    // Build conversation history
    const historyText = history.map(h =>
      `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
    ).join('\n')

    const prompt = `You are analyzing an image. Here is the existing metadata:

${metadataContext}

${historyText ? `Previous conversation:\n${historyText}\n` : ''}
User's new question: ${message}

Respond helpfully about the image. If the user asks to modify tags, description, or other metadata, include an "updatedMetadata" object with the changes.

Format your response as JSON:
{
  "message": "Your helpful response here",
  "updatedMetadata": {
    "tags": ["new", "tags", "if changed"],
    "description": "new description if changed",
    "suggestedTitle": "new title if changed"
  }
}

Only include updatedMetadata if the user requested changes. The message field is required.`

    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        images: [imageBase64],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    const data = await response.json()

    try {
      // Try to parse JSON response
      const jsonMatch = data.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          message: parsed.message || data.response,
          updatedMetadata: parsed.updatedMetadata,
        }
      }
    } catch {
      // Fallback to plain text response
    }

    return {
      message: data.response || 'No response from model',
    }
  },

  isConfigured: () => {
    // Can't check async here - return true and handle errors in analyze()
    return true
  },
}

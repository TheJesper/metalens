import { AnalysisResult, VisionAdapter, ChatMessage, ChatResponse } from './types'
import { getApiKeys } from './state'

// Convert File to base64
const fileToBase64 = (file: File): Promise<{ data: string; mediaType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extract media type and base64 data
      const matches = result.match(/^data:(.+);base64,(.+)$/)
      if (matches) {
        resolve({ data: matches[2], mediaType: matches[1] })
      } else {
        reject(new Error('Invalid data URL'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Extract base64 from data URL
const parseDataUrl = (dataUrl: string): { data: string; mediaType: string } => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (matches) {
    return { data: matches[2], mediaType: matches[1] }
  }
  return { data: dataUrl, mediaType: 'image/png' }
}

// Claude Vision API adapter (Anthropic Messages API)
export const claudeAdapter: VisionAdapter = {
  name: 'Claude Vision',
  models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-latest', 'claude-3-haiku-20240307'],

  async analyze(image: File | string, model: string): Promise<AnalysisResult> {
    const apiKey = getApiKeys().claude
    if (!apiKey) {
      throw new Error('Claude API key not configured')
    }

    // Get image as base64
    let imageData: { data: string; mediaType: string }
    if (image instanceof File) {
      imageData = await fileToBase64(image)
    } else if (image.startsWith('data:')) {
      imageData = parseDataUrl(image)
    } else {
      throw new Error('Invalid image format')
    }

    let response: Response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: imageData.mediaType,
                    data: imageData.data,
                  },
                },
                {
                  type: 'text',
                  text: `Analyze this image and return JSON metadata:
{"tags":["keyword1","keyword2"],"objects":[{"name":"object","confidence":0.9}],"colors":[{"hex":"#RRGGBB","name":"color","percentage":30}],"mood":"word","scene":"type","description":"description","suggestedTitle":"title"}

Return only valid JSON.`,
                },
              ],
            },
          ],
        }),
      })
    } catch (error) {
      throw new Error(`Network error - check your API key and internet connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const parsed = JSON.parse(jsonMatch[0])

      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['image'],
        objects: Array.isArray(parsed.objects) ? parsed.objects : [],
        colors: Array.isArray(parsed.colors) ? parsed.colors : [{ hex: '#888888', name: 'Gray', percentage: 100 }],
        mood: parsed.mood || 'neutral',
        scene: parsed.scene || 'unknown',
        description: parsed.description || 'No description',
        suggestedTitle: parsed.suggestedTitle || 'Untitled',
      }
    } catch (parseError) {
      console.warn('Claude response not JSON:', content)
      return {
        tags: ['image', 'analyzed'],
        objects: [],
        colors: [{ hex: '#888888', name: 'Gray', percentage: 100 }],
        mood: 'neutral',
        scene: 'unknown',
        description: content.slice(0, 300) || 'Image analyzed',
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
    const apiKey = getApiKeys().claude
    if (!apiKey) throw new Error('Claude API key not configured')

    const imageData = parseDataUrl(image)

    // Build messages array
    const messages: Array<{ role: string; content: unknown }> = []

    // Add history
    for (const h of history) {
      messages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      })
    }

    // Add current message with image
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageData.mediaType,
            data: imageData.data,
          },
        },
        {
          type: 'text',
          text: `Current metadata: ${JSON.stringify(metadata)}

User: ${message}

Respond helpfully. If user asks for metadata changes, include {"updatedMetadata":{...}} in your response.`,
        },
      ],
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*"updatedMetadata"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          message: parsed.message || content.replace(jsonMatch[0], '').trim(),
          updatedMetadata: parsed.updatedMetadata,
        }
      }
    } catch {
      // Plain text response
    }

    return { message: content || 'No response' }
  },

  isConfigured(): boolean {
    return !!getApiKeys().claude
  },
}

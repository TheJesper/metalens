import { AnalysisResult, VisionAdapter, ChatMessage, ChatResponse } from './types'
import { getApiKeys } from './state'

// Convert File to base64
const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const matches = result.match(/^data:(.+);base64,(.+)$/)
      if (matches) {
        resolve({ data: matches[2], mimeType: matches[1] })
      } else {
        reject(new Error('Invalid data URL'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Extract base64 from data URL
const parseDataUrl = (dataUrl: string): { data: string; mimeType: string } => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (matches) {
    return { data: matches[2], mimeType: matches[1] }
  }
  return { data: dataUrl, mimeType: 'image/png' }
}

// Google Gemini Vision API adapter
export const googleAdapter: VisionAdapter = {
  name: 'Google Vision',
  models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],

  async analyze(image: File | string, model: string): Promise<AnalysisResult> {
    const apiKey = getApiKeys().google
    if (!apiKey) {
      throw new Error('Google API key not configured')
    }

    // Get image as base64
    let imageData: { data: string; mimeType: string }
    if (image instanceof File) {
      imageData = await fileToBase64(image)
    } else if (image.startsWith('data:')) {
      imageData = parseDataUrl(image)
    } else {
      throw new Error('Invalid image format')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.data,
                  },
                },
                {
                  text: `Analyze this image and return JSON metadata:
{"tags":["keyword1","keyword2"],"objects":[{"name":"object","confidence":0.9}],"colors":[{"hex":"#RRGGBB","name":"color","percentage":30}],"mood":"word","scene":"type","description":"description","suggestedTitle":"title"}

Return only valid JSON, no markdown.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
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
      console.warn('Gemini response not JSON:', content)
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
    const apiKey = getApiKeys().google
    if (!apiKey) throw new Error('Google API key not configured')

    const imageData = parseDataUrl(image)

    // Build conversation contents
    const contents: Array<{ role: string; parts: unknown[] }> = []

    // Add history
    for (const h of history) {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })
    }

    // Add current message with image
    contents.push({
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        },
        {
          text: `Current metadata: ${JSON.stringify(metadata)}

User: ${message}

Respond helpfully. If user asks for metadata changes, include {"updatedMetadata":{...}} in your response.`,
        },
      ],
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

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
    return !!getApiKeys().google
  },
}

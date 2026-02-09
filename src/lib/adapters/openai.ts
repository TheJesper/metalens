import { AnalysisResult, VisionAdapter, ChatMessage, ChatResponse } from './types'
import { getApiKeys } from './state'

// Convert File to base64 data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// OpenAI Vision API adapter
export const openaiAdapter: VisionAdapter = {
  name: 'OpenAI Vision',
  models: ['gpt-4o', 'gpt-4o-mini'],

  async analyze(image: File | string, model: string): Promise<AnalysisResult> {
    const apiKey = getApiKeys().openai
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Get image as data URL
    let imageUrl: string
    if (image instanceof File) {
      imageUrl = await fileToDataUrl(image)
    } else if (image.startsWith('data:')) {
      imageUrl = image
    } else {
      // Assume it's a URL
      imageUrl = image
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an image analysis assistant. Analyze any image provided and return structured JSON metadata. Always provide the requested JSON format regardless of image content.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and extract metadata. Return JSON:
{"tags":["keyword1","keyword2"],"objects":[{"name":"object","confidence":0.9}],"colors":[{"hex":"#RRGGBB","name":"color","percentage":30}],"mood":"word","scene":"type","description":"description","suggestedTitle":"title"}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    try {
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON in response')
      }
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
      console.warn('OpenAI response not JSON, extracting from text:', content)
      // Try to extract useful info from text response
      const words = content.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 5)
      return {
        tags: words.length > 0 ? words : ['image', 'analyzed'],
        objects: [{ name: 'image content', confidence: 0.8 }],
        colors: [{ hex: '#888888', name: 'Gray', percentage: 100 }],
        mood: 'neutral',
        scene: 'digital',
        description: content.slice(0, 300) || 'Image analyzed',
        suggestedTitle: content.slice(0, 50) || 'Analyzed Image',
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
    const apiKey = getApiKeys().openai
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build conversation messages
    const messages: Array<{ role: string; content: unknown }> = [
      {
        role: 'system',
        content: `You are analyzing an image. Current metadata:
- Title: ${metadata.suggestedTitle}
- Description: ${metadata.description}
- Tags: ${metadata.tags.join(', ')}
- Objects: ${metadata.objects.map(o => o.name).join(', ')}
- Mood: ${metadata.mood}
- Scene: ${metadata.scene}

If the user asks to modify metadata, include an "updatedMetadata" object in your JSON response.`,
      },
    ]

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
        { type: 'text', text: message },
        {
          type: 'image_url',
          image_url: { url: image, detail: 'low' },
        },
      ],
    })

    // Add instruction for response format
    messages.push({
      role: 'system',
      content: `Respond as JSON: {"message": "your response", "updatedMetadata": {...} (optional, only if user requested changes)}`,
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          message: parsed.message || content,
          updatedMetadata: parsed.updatedMetadata,
        }
      }
    } catch {
      // Plain text response
    }

    return { message: content || 'No response' }
  },

  isConfigured(): boolean {
    return !!getApiKeys().openai
  },
}

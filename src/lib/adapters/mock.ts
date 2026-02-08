import { AnalysisResult, VisionAdapter } from './types'

const MOCK_TAGS = [
  ['nature', 'landscape', 'outdoor', 'scenic', 'mountains'],
  ['portrait', 'person', 'face', 'human', 'professional'],
  ['urban', 'city', 'architecture', 'building', 'street'],
  ['food', 'cuisine', 'delicious', 'restaurant', 'meal'],
  ['animal', 'wildlife', 'pet', 'cute', 'nature'],
]

const MOCK_MOODS = ['serene', 'vibrant', 'mysterious', 'joyful', 'contemplative']
const MOCK_SCENES = ['outdoor daylight', 'indoor studio', 'sunset golden hour', 'urban night', 'natural forest']

const MOCK_COLORS = [
  { hex: '#8B5CF6', name: 'Purple', percentage: 35 },
  { hex: '#3B82F6', name: 'Blue', percentage: 25 },
  { hex: '#10B981', name: 'Green', percentage: 20 },
  { hex: '#F59E0B', name: 'Amber', percentage: 12 },
  { hex: '#EF4444', name: 'Red', percentage: 8 },
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAdapter: VisionAdapter = {
  name: 'Mock (Demo)',
  models: ['demo-v1'],

  async analyze(_image: File | string): Promise<AnalysisResult> {
    await delay(800 + Math.random() * 1200)

    const tagSet = MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)]
    const mood = MOCK_MOODS[Math.floor(Math.random() * MOCK_MOODS.length)]
    const scene = MOCK_SCENES[Math.floor(Math.random() * MOCK_SCENES.length)]
    const colors = [...MOCK_COLORS].sort(() => Math.random() - 0.5).slice(0, 4)

    return {
      tags: tagSet,
      objects: [
        { name: tagSet[0], confidence: 0.95 + Math.random() * 0.05 },
        { name: tagSet[1], confidence: 0.85 + Math.random() * 0.1 },
        { name: tagSet[2], confidence: 0.7 + Math.random() * 0.15 },
      ],
      colors,
      mood,
      scene,
      description: `A ${mood} ${scene} scene featuring ${tagSet.slice(0, 3).join(', ')}.`,
      suggestedTitle: `${tagSet[0].charAt(0).toUpperCase() + tagSet[0].slice(1)} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
    }
  },

  isConfigured: () => true,
}

import { describe, it, expect } from 'vitest'
import { generateExportData, createExportFilename } from '../lib/export'
import type { AnalysisResult } from '../lib/adapters'

const mockResult: AnalysisResult = {
  tags: ['nature', 'landscape'],
  objects: [{ name: 'mountain', confidence: 0.95 }],
  colors: [{ hex: '#007ACC', name: 'Blue', percentage: 40 }],
  mood: 'serene',
  scene: 'outdoor daylight',
  description: 'A beautiful mountain landscape',
  suggestedTitle: 'Mountain Serenity',
}

describe('Export Utilities', () => {
  describe('generateExportData', () => {
    it('should include version field', () => {
      const data = generateExportData([mockResult])
      expect(data.version).toBe('1.0')
    })

    it('should include exportedAt timestamp', () => {
      const data = generateExportData([mockResult])
      expect(data.exportedAt).toBeDefined()
      expect(new Date(data.exportedAt).getTime()).not.toBeNaN()
    })

    it('should include correct count', () => {
      const data = generateExportData([mockResult, mockResult])
      expect(data.count).toBe(2)
    })

    it('should include all results', () => {
      const data = generateExportData([mockResult])
      expect(data.results).toHaveLength(1)
      expect(data.results[0].tags).toEqual(['nature', 'landscape'])
    })

    it('should handle empty results array', () => {
      const data = generateExportData([])
      expect(data.count).toBe(0)
      expect(data.results).toEqual([])
    })
  })

  describe('createExportFilename', () => {
    it('should include metalens prefix', () => {
      const filename = createExportFilename()
      expect(filename).toMatch(/^metalens-export-/)
    })

    it('should include timestamp', () => {
      const filename = createExportFilename()
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should have .json extension', () => {
      const filename = createExportFilename()
      expect(filename).toMatch(/\.json$/)
    })
  })
})

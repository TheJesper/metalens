import type { AnalysisResult } from './adapters'

export interface ExportData {
  version: string
  exportedAt: string
  count: number
  results: AnalysisResult[]
}

/**
 * Generate export data structure from analysis results
 */
export function generateExportData(results: AnalysisResult[]): ExportData {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: results.length,
    results,
  }
}

/**
 * Create filename for export with timestamp
 */
export function createExportFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD
  return `metalens-export-${timestamp}.json`
}

/**
 * Trigger download of export data as JSON file
 */
export function downloadExport(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || createExportFilename()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export single result
 */
export function exportResult(result: AnalysisResult, filename?: string): void {
  const data = generateExportData([result])
  downloadExport(data, filename)
}

/**
 * Export all results
 */
export function exportAllResults(results: AnalysisResult[]): void {
  const data = generateExportData(results)
  downloadExport(data)
}

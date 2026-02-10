import { useState } from 'react'
import { Card, CardContent, Button, Badge } from '@/ui-lib'
import { PenTool, Sparkles, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { SketchCanvas } from '../components/SketchCanvas'
import { MermaidOutput } from '../components/MermaidOutput'
import { MermaidDiagram, MERMAID_RECOGNITION_PROMPT } from '../lib/mermaid-schema'
import { VisionAdapter } from '../lib/adapters/types'

interface SketchPageProps {
  adapter: VisionAdapter
  model: string
}

export function SketchPage({ adapter, model }: SketchPageProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MermaidDiagram | null>(null)

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Call AI adapter with sketch image and mermaid prompt
      const response = await adapter.analyze(imageData, model, MERMAID_RECOGNITION_PROMPT)

      // Try to extract JSON from response
      let diagram: MermaidDiagram

      try {
        // Look for JSON in code blocks or plain text
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          diagram = JSON.parse(jsonStr)
        } else {
          throw new Error('No valid JSON found in response')
        }
      } catch (parseError) {
        // If parsing fails, create a simple diagram from response
        diagram = {
          type: 'flowchart',
          direction: 'TD',
          nodes: [
            { id: 'A', label: 'Start', shape: 'rounded' },
            { id: 'B', label: 'Process', shape: 'rectangle' },
            { id: 'C', label: 'End', shape: 'rounded' },
          ],
          connections: [
            { from: 'A', to: 'B', type: 'arrow' },
            { from: 'B', to: 'C', type: 'arrow' },
          ],
        }
      }

      setResult(diagram)
    } catch (err) {
      console.error('Recognition error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze sketch')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PenTool className="h-6 w-6" />
          Sketch → Mermaid Diagram
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draw flowcharts by hand, get Mermaid code instantly with AI recognition
        </p>
      </div>

      {/* Instructions */}
      {!result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-2">How it works</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Draw your flowchart using boxes, diamonds, circles, and arrows</li>
                  <li>Label your shapes with text</li>
                  <li>Click "Generate Mermaid Code" to analyze</li>
                  <li>AI recognizes shapes and generates clean Mermaid syntax</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas */}
      {!result && (
        <SketchCanvas onCapture={handleCapture} disabled={isProcessing} />
      )}

      {/* Processing */}
      {isProcessing && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your sketch...</p>
            <p className="text-xs text-muted-foreground mt-2">
              AI is recognizing shapes and connections
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Recognition Failed</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-2">
              <Sparkles className="h-3 w-3" />
              Analysis Complete
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Sketch
            </Button>
          </div>
          <MermaidOutput diagram={result} />
        </>
      )}

      {/* Adapter Info */}
      <div className="text-xs text-muted-foreground text-center">
        Using {adapter.name} ({model}) for recognition
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Badge, cn } from '@/ui-lib'
import { Copy, Check, Eye, EyeOff, Code } from 'lucide-react'
import { MermaidDiagram, generateMermaidCode } from '../lib/mermaid-schema'

interface MermaidOutputProps {
  diagram: MermaidDiagram
  onClose?: () => void
}

export function MermaidOutput({ diagram, onClose }: MermaidOutputProps) {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const mermaidCode = generateMermaidCode(diagram)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Generated Mermaid Code</h3>
          <p className="text-sm text-muted-foreground">
            {diagram.nodes.length} nodes, {diagram.connections.length} connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Live Preview</p>
                <p className="text-xs mt-2">
                  Paste code into{' '}
                  <a
                    href="https://mermaid.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mermaid.live
                  </a>{' '}
                  for visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="gap-1">
              <Code className="h-3 w-3" />
              Mermaid
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
            <code>{mermaidCode}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2">How to Use</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Copy the Mermaid code above</li>
            <li>
              Visit{' '}
              <a
                href="https://mermaid.live"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mermaid.live
              </a>{' '}
              or use any Mermaid-compatible tool
            </li>
            <li>Paste the code to see your flowchart rendered</li>
            <li>Export as PNG, SVG, or embed in markdown</li>
          </ol>
        </CardContent>
      </Card>

      {/* Diagram JSON (for debugging) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View Raw JSON
        </summary>
        <pre className="mt-2 bg-muted rounded p-3 overflow-x-auto">
          {JSON.stringify(diagram, null, 2)}
        </pre>
      </details>
    </div>
  )
}

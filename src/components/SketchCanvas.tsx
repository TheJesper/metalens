import { useRef, useState, useEffect } from 'react'
import { Button, Card, CardContent, cn } from '@/ui-lib'
import { Eraser, Trash2 } from 'lucide-react'

interface SketchCanvasProps {
  onCapture: (imageData: string) => void
  disabled?: boolean
}

export function SketchCanvas({ onCapture, disabled }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Initialize with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing style
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setContext(ctx)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || disabled) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'pen') {
      context.strokeStyle = '#000000'
      context.lineWidth = 2
    } else {
      context.strokeStyle = '#ffffff'
      context.lineWidth = 20
    }

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (!context) return
    context.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const captureCanvas = () => {
    if (!canvasRef.current) return
    const imageData = canvasRef.current.toDataURL('image/png')
    onCapture(imageData)
  }

  return (
    <div className="space-y-4">
      {/* Tools */}
      <div className="flex items-center gap-2">
        <Button
          variant={tool === 'pen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('pen')}
          disabled={disabled}
        >
          Pen
        </Button>
        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('eraser')}
          disabled={disabled}
          className="gap-2"
        >
          <Eraser className="h-4 w-4" />
          Eraser
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          disabled={disabled}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={cn(
              'border rounded-lg bg-white w-full',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
            )}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={captureCanvas}
        disabled={disabled}
        className="w-full"
      >
        Generate Mermaid Code
      </Button>
    </div>
  )
}

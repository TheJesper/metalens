// Mermaid diagram schema for AI recognition

export interface MermaidNode {
  id: string
  label: string
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon' | 'parallelogram'
}

export interface MermaidConnection {
  from: string
  to: string
  label?: string
  type: 'arrow' | 'dotted' | 'thick'
}

export interface MermaidDiagram {
  type: 'flowchart' | 'sequence' | 'class' | 'state'
  direction: 'TD' | 'LR' | 'BT' | 'RL'
  nodes: MermaidNode[]
  connections: MermaidConnection[]
}

// Convert schema to Mermaid code
export function generateMermaidCode(diagram: MermaidDiagram): string {
  const lines: string[] = []

  // Header
  if (diagram.type === 'flowchart') {
    lines.push(`flowchart ${diagram.direction}`)
  }

  // Nodes
  diagram.nodes.forEach((node) => {
    const shapeStart = getShapeStart(node.shape)
    const shapeEnd = getShapeEnd(node.shape)
    lines.push(`    ${node.id}${shapeStart}"${node.label}"${shapeEnd}`)
  })

  // Connections
  diagram.connections.forEach((conn) => {
    const arrow = getArrow(conn.type)
    if (conn.label) {
      lines.push(`    ${conn.from} ${arrow}|"${conn.label}"| ${conn.to}`)
    } else {
      lines.push(`    ${conn.from} ${arrow} ${conn.to}`)
    }
  })

  return lines.join('\n')
}

function getShapeStart(shape: MermaidNode['shape']): string {
  switch (shape) {
    case 'rectangle':
      return '['
    case 'rounded':
      return '('
    case 'circle':
      return '(('
    case 'diamond':
      return '{'
    case 'hexagon':
      return '{{'
    case 'parallelogram':
      return '[/'
    default:
      return '['
  }
}

function getShapeEnd(shape: MermaidNode['shape']): string {
  switch (shape) {
    case 'rectangle':
      return ']'
    case 'rounded':
      return ')'
    case 'circle':
      return '))'
    case 'diamond':
      return '}'
    case 'hexagon':
      return '}}'
    case 'parallelogram':
      return '/]'
    default:
      return ']'
  }
}

function getArrow(type: MermaidConnection['type']): string {
  switch (type) {
    case 'arrow':
      return '-->'
    case 'dotted':
      return '-..->'
    case 'thick':
      return '==>'
    default:
      return '-->'
  }
}

// Sample prompt for AI
export const MERMAID_RECOGNITION_PROMPT = `Analyze this hand-drawn flowchart sketch and extract the diagram structure.

Identify:
1. Nodes (boxes, circles, diamonds, etc.)
2. Text labels inside shapes
3. Connections/arrows between shapes

Return JSON following this schema:
{
  "type": "flowchart",
  "direction": "TD",
  "nodes": [
    { "id": "A", "label": "Start", "shape": "rounded" },
    { "id": "B", "label": "Process", "shape": "rectangle" },
    { "id": "C", "label": "Decision?", "shape": "diamond" }
  ],
  "connections": [
    { "from": "A", "to": "B", "type": "arrow" },
    { "from": "B", "to": "C", "type": "arrow", "label": "yes" }
  ]
}

Shape types: rectangle, rounded, circle, diamond, hexagon, parallelogram
Connection types: arrow, dotted, thick
Directions: TD (top-down), LR (left-right), BT (bottom-top), RL (right-left)`

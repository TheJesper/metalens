# SPEC-META-004: Sketch to Mermaid Diagram

> **Status:** draft
> **Created:** 2026-02-09
> **Updated:** 2026-02-09

---

## Requirements

### Stories

- [ ] **REQ-1:** WHEN user draws a sketch THE SYSTEM SHALL recognize shapes and connections
- [ ] **REQ-2:** WHEN sketch is recognized THE SYSTEM SHALL generate Mermaid diagram code
- [ ] **REQ-3:** WHEN generating Mermaid THE SYSTEM SHALL use structured JSON output from AI
- [ ] **REQ-4:** WHEN displaying result THE SYSTEM SHALL show both code and rendered preview
- [ ] **REQ-5:** WHEN user clicks copy THE SYSTEM SHALL copy Mermaid code to clipboard

### Acceptance Criteria

- [ ] Canvas for freehand drawing
- [ ] Shape recognition (rectangles, circles, diamonds, arrows)
- [ ] Text recognition in shapes
- [ ] Mermaid code generation
- [ ] Live preview of rendered diagram
- [ ] Copy button for Mermaid code
- [ ] Section properly described as "Sketch → Mermaid Diagram"

---

## Design

### Page Description

**Current:** "Draw → Mermaid 2" (unclear)
**Proposed:** "Sketch → Mermaid Diagram"

Subtitle: "Draw flowcharts by hand, get Mermaid code instantly"

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Canvas Sketch  │ ──▶ │  Vision AI       │ ──▶ │  Mermaid Code   │
│  (user draws)   │     │  (structured     │     │  (generated)    │
│                 │     │   JSON output)   │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                         │
                                                 ┌───────▼────────┐
                                                 │  Mermaid       │
                                                 │  Preview       │
                                                 └────────────────┘
```

### Structured JSON Schema for AI

```typescript
interface MermaidRequest {
  image: string  // base64 sketch image
  schema: MermaidSchema
}

interface MermaidSchema {
  type: "flowchart" | "sequence" | "class" | "state"
  direction: "TD" | "LR" | "BT" | "RL"
  nodes: Array<{
    id: string
    label: string
    shape: "rectangle" | "rounded" | "circle" | "diamond" | "database"
  }>
  edges: Array<{
    from: string
    to: string
    label?: string
    style: "solid" | "dotted" | "thick"
  }>
}

interface MermaidResponse {
  mermaidCode: string
  nodes: MermaidSchema["nodes"]
  edges: MermaidSchema["edges"]
  confidence: number
}
```

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Sketch → Mermaid Diagram                                        │
│ Draw flowcharts by hand, get Mermaid code instantly             │
├────────────────────────────┬────────────────────────────────────┤
│                            │  Mermaid Code              [Copy]  │
│   ┌──────────────────┐    │  ```mermaid                        │
│   │                  │    │  graph TD                          │
│   │   [Canvas]       │    │    A[Start] --> B{Decision}        │
│   │                  │    │    B -->|Yes| C[Action]            │
│   │   Draw here...   │    │    B -->|No| D[End]                │
│   │                  │    │  ```                               │
│   └──────────────────┘    ├────────────────────────────────────┤
│                            │  Preview                          │
│   [Clear] [Recognize]     │  ┌─────────────────────────────┐   │
│                            │  │  [Rendered Mermaid]         │   │
│                            │  └─────────────────────────────┘   │
└────────────────────────────┴────────────────────────────────────┘
```

### Prompt Template

```
Analyze this hand-drawn sketch and convert it to a Mermaid diagram.

Recognize:
- Rectangles → process nodes
- Rounded rectangles → start/end
- Diamonds → decision nodes
- Circles → connectors
- Arrows → edges (note direction and any labels)
- Text inside shapes → node labels
- Text on arrows → edge labels

Return as JSON matching this schema:
{schema}

Be precise with node connections based on arrow directions.
```

---

## Tasks

- [ ] **TASK-1:** Rename "Draw → Mermaid 2" to "Sketch → Mermaid Diagram"
- [ ] **TASK-2:** Add proper description subtitle
- [ ] **TASK-3:** Implement canvas drawing component
- [ ] **TASK-4:** Create Mermaid JSON schema for structured output
- [ ] **TASK-5:** Implement AI recognition with structured JSON
- [ ] **TASK-6:** Add Mermaid code display with copy button
- [ ] **TASK-7:** Add live Mermaid preview renderer
- [ ] **TASK-8:** Add clear canvas button

---

## References

- Mermaid.js: https://mermaid.js.org/
- FlowBoard DSL spec: `W:/code/flowboard/docs/specs/FLOWBOARD-DSL-SPEC.md`
- Ollama structured output: JSON mode in generate API

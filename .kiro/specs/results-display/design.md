# Results Display - Design

## Architecture

### Component Structure
```
src/
├── App.tsx                    # Results state management
└── components/
    ├── ResultsGrid.tsx       # Grid container (TODO)
    └── ResultCard.tsx        # Individual result card (TODO)
```

## Data Model

### ImageResult State
```typescript
interface ImageResult {
  file: File
  preview: string           // Object URL
  status: 'pending' | 'processing' | 'complete' | 'error'
  result?: AnalysisResult
  error?: string
}
```

## Component Specifications

### ResultsGrid Props
```typescript
interface ResultsGridProps {
  results: ImageResult[]
  totalProgress: number     // 0-100
}
```

### ResultCard Props
```typescript
interface ResultCardProps {
  item: ImageResult
}
```

## Layout

### Responsive Grid
```css
/* Mobile */
grid-cols-1

/* Tablet */
md:grid-cols-2

/* Desktop */
lg:grid-cols-3
```

### Card Layout
```
┌─────────────────────────┐
│ [Image Preview 16:9]    │
│                   [Badge]│
├─────────────────────────┤
│ Suggested Title         │
│ [tag] [tag] [tag] [tag] │
│ [■■■■] Color swatches   │
│ Description text...     │
└─────────────────────────┘
```

## Status Badge Variants
| Status | Component | Style |
|--------|-----------|-------|
| pending | - | No badge |
| processing | Badge + Loader2 | secondary |
| complete | Badge + Check | bg-green-600 |
| error | Badge + AlertCircle | destructive |

## Unit Testing Approach
- Test grid renders correct number of cards
- Test status badges display correctly
- Test progress bar calculations
- Test responsive breakpoints

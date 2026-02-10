# Queue & Facial Recognition System

**Version:** 1.0
**Date:** 2026-02-10
**Status:** Planning

## Overview

Transform MetaLens from immediate-processing to queue-based workflow with facial recognition capabilities.

## 1. Queue System

### 1.1 Queue Flow
```
Upload → Queue (pending) → [Process] → Recent/Library (analyzed)
```

- **Queue View**: Images awaiting processing
- **Recent/Library**: Successfully analyzed images
- Images move from Queue → Recent automatically after processing completes

### 1.2 Auto-Process Queue
- Checkbox: "Auto-process queue"
- When enabled: automatically processes queue items as they're added
- When disabled: manual "Process Queue" button appears

### 1.3 Queue UI
```
┌─────────────────────────────────────┐
│ Queue (5)          [Process All] [×]│
├─────────────────────────────────────┤
│ [img] [img] [img] [img] [img]       │
│                                     │
│ ☐ Auto-process on upload            │
└─────────────────────────────────────┘
```

## 2. Facial Recognition System

### 2.1 Face Detection
- **Provider**: OpenAI Vision API (gpt-4o)
- **Prompt**: Extract faces with bounding boxes, confidence, estimated age/gender
- **Storage**: Face data stored with each image in localStorage

### 2.2 Face Buckets (Person Groups)
```
┌───────────────────────────────────────────────┐
│ Faces                                         │
├───────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│ │ Person1 │  │ Person2 │  │Unknown  │        │
│ │ [😊😊😊] │  │ [😊😊]  │  │ [😊😊😊] │        │
│ │ 12 faces│  │ 8 faces │  │ 15 faces│        │
│ └─────────┘  └─────────┘  └─────────┘        │
└───────────────────────────────────────────────┘
```

### 2.3 Face Bucket View
Clicking a bucket shows all faces:
```
┌────────────────────────────────────────────────┐
│ Person: "John Doe"                    [Rename] │
│ 12 faces                                       │
├────────────────────────────────────────────────┤
│ [Face1] [Face2] [Face3] [Face4]                │
│ [Face5] [Face6] [Face7] [Face8]                │
│                                                │
│ Actions:                                       │
│ • Rescan all faces                             │
│ • Discard all face data                        │
│ • Move to another person                       │
│ • Select faces to reassign                     │
└────────────────────────────────────────────────┘
```

### 2.4 New Face Detection
When new faces detected:
```
┌─────────────────────────────────────┐
│ New faces detected (3)              │
│                                     │
│ Who is this?                        │
│ [Face thumbnail]                    │
│ Name: [________]         [Skip]     │
│                         [Existing▼] │
└─────────────────────────────────────┘
```

## 3. Webcam Capture

### 3.1 Camera UI
```
┌─────────────────────────────────────┐
│         📷 Capture Photo            │
├─────────────────────────────────────┤
│                                     │
│     [  Live camera preview  ]       │
│                                     │
│  [Front Camera ▼]     [📸 Capture]  │
│                                     │
│  Send to:                           │
│  ○ Metadata Analysis                │
│  ○ Face Recognition                 │
└─────────────────────────────────────┘
```

### 3.2 Camera Access
- Button in main nav: "📷 Capture"
- Request `navigator.mediaDevices.getUserMedia()`
- Front/rear camera selection (if available)
- Captured photo → Queue or direct to processing

## 4. Image Hover Menu

### 4.1 Hover Toolbar Design
```
┌─────────────────┐
│ ┌─────────────┐ │ ← Hover shows toolbar
│ │ [↻] [✓] [×] │ │    at top of image
│ └─────────────┘ │
│                 │
│   [Image]       │
│                 │
└─────────────────┘
```

### 4.2 Actions
- **↻ Rescan**: Re-analyze metadata or faces
- **✓ Approve**: Mark as reviewed
- **× Discard**: Remove metadata/face data
- **→ Move**: Move between Queue/Recent/Archive
- **⋮ More**: Additional options (export, download, etc.)

### 4.3 Hover States
- Toolbar appears on hover (slide down animation)
- Semi-transparent background
- Icons with tooltips
- Click action triggers immediately

## 5. Selection System

### 5.1 Selection Modes
- **None selected**: Normal view
- **Single select**: Click image
- **Multi-select**: Ctrl+Click or Cmd+Click
- **Range select**: Shift+Click
- **Select All**: Button or Ctrl+A
- **Select None**: Button or Escape

### 5.2 Selection UI
```
┌─────────────────────────────────────────────┐
│ 3 selected    [Select All] [Select None]   │
│               [Process] [Delete] [Move]     │
├─────────────────────────────────────────────┤
│ [✓img] [ img] [✓img] [ img] [✓img]         │
└─────────────────────────────────────────────┘
```

### 5.3 Visual Feedback
- Selected images: blue border + checkmark overlay
- Hover: subtle highlight
- Cursor changes:
  - Normal: `cursor-pointer`
  - Multi-select mode: `cursor-cell`
  - Range select: `cursor-copy`

### 5.4 Batch Actions
When items selected:
- **Process Selected**: Analyze selected images
- **Delete Selected**: Remove from queue/library
- **Move Selected**: Queue → Recent or Recent → Archive
- **Export Selected**: Download metadata JSON
- **Assign to Person**: (Face page only) Group faces

## 6. Page Structure

### 6.1 Meta Analysis Page
```
┌─────────────────────────────────────────────┐
│ 🔍 MetaLens      Queue | Recent | Library   │
├─────────────────────────────────────────────┤
│ ┌─────────┬──────────────┐                  │
│ │ Upload  │ AI Engine    │                  │
│ │ Queue   │ Settings     │                  │
│ └─────────┴──────────────┘                  │
│                                             │
│ Queue (5)              [Process All]        │
│ [img] [img] [img] [img] [img]               │
│                                             │
│ Recent (12)            [Clear]              │
│ [img] [img] [img] [img] [img] [img]...      │
└─────────────────────────────────────────────┘
```

### 6.2 Face Recognition Page
```
┌─────────────────────────────────────────────┐
│ 😊 Faces         People | Unassigned         │
├─────────────────────────────────────────────┤
│ People (3)                                  │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│ │ John    │  │ Jane    │  │ Unknown │      │
│ │ 12 faces│  │ 8 faces │  │ 15 faces│      │
│ └─────────┘  └─────────┘  └─────────┘      │
│                                             │
│ Recent Faces (10)      [Process All]        │
│ [face] [face] [face] [face]...              │
└─────────────────────────────────────────────┘
```

## 7. Data Models

### 7.1 Queue Item
```typescript
interface QueueItem {
  id: string
  file: File
  thumbnail: string
  addedAt: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  processingProgress?: number
}
```

### 7.2 Face Data
```typescript
interface FaceData {
  id: string
  imageId: string
  boundingBox: { x: number; y: number; width: number; height: number }
  confidence: number
  personId?: string // Link to person bucket
  estimatedAge?: number
  estimatedGender?: string
  embedding?: number[] // For similarity matching (future)
}

interface Person {
  id: string
  name: string
  faceIds: string[]
  createdAt: string
  updatedAt: string
}
```

### 7.3 Image with Faces
```typescript
interface StoredImage {
  // ... existing fields
  faces?: FaceData[]
  faceProcessedAt?: string
}
```

## 8. Implementation Phases

### Phase 1: Queue System (Priority 1)
- [ ] Create Queue storage (localStorage)
- [ ] Add Queue view/tab
- [ ] Implement upload → Queue flow
- [ ] Auto-process checkbox
- [ ] Manual "Process Queue" button
- [ ] Queue → Recent after processing

### Phase 2: Selection System (Priority 1)
- [ ] Multi-select with Ctrl/Cmd
- [ ] Range select with Shift
- [ ] Select All/None buttons
- [ ] Visual feedback (checkmarks, borders)
- [ ] Batch actions toolbar

### Phase 3: Hover Menu (Priority 2)
- [ ] Hover toolbar component
- [ ] Actions: Rescan, Discard, Move
- [ ] Smooth animations
- [ ] Tooltips

### Phase 4: Facial Recognition (Priority 2)
- [ ] Face detection API integration (OpenAI)
- [ ] Face data storage
- [ ] Person buckets UI
- [ ] Face bucket detail view
- [ ] New face assignment dialog
- [ ] Face similarity grouping

### Phase 5: Webcam Capture (Priority 3)
- [ ] Camera access UI
- [ ] Live preview
- [ ] Front/rear camera switch
- [ ] Capture to Queue or direct analysis
- [ ] Send to Meta or Face page

## 9. UI/UX Patterns (Reusable)

### 9.1 ImageGrid Component
Used in both Meta and Face pages:
- Thumbnail display
- Hover toolbar
- Selection checkboxes
- Status indicators
- Drag selection (future)

### 9.2 BatchActionBar Component
Shows when items selected:
- Selected count
- Select All/None
- Context-specific actions (Process, Delete, Assign, etc.)

### 9.3 QueueCard Component
- Compact queue display
- Progress indicators
- Auto-process toggle

## 10. Technical Notes

### 10.1 localStorage Limits
- Typical limit: 5-10MB
- Images stored as thumbnails (base64)
- Face embeddings can be large - store only essential data
- Implement cleanup/archive if storage full

### 10.2 Performance
- Lazy load thumbnails in large grids
- Virtual scrolling for 100+ images
- Debounce hover events
- IndexedDB for larger datasets (future)

### 10.3 Accessibility
- Keyboard navigation (arrow keys in grid)
- Focus indicators
- ARIA labels for actions
- Screen reader announcements for batch actions

## 11. Open Questions

1. Should we implement face similarity matching (ML embeddings)?
2. Export format for face data (JSON, CSV)?
3. Archive feature for old images?
4. Undo/redo for batch actions?
5. Shortcuts cheat sheet (? key)?

---

**Next Steps:**
1. Add tasks to orchestrator (`/orch task`)
2. Implement Phase 1 (Queue System)
3. Add selection system
4. Iterate based on feedback

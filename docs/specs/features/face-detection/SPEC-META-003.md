# SPEC-META-003: Face Detection Integration

> **Status:** draft
> **Created:** 2026-02-09
> **Updated:** 2026-02-09

---

## Requirements

### Stories

- [ ] **REQ-1:** WHEN face detection is enabled THE SYSTEM SHALL detect faces in uploaded images
- [ ] **REQ-2:** WHEN faces are detected THE SYSTEM SHALL show face cutouts as thumbnails
- [ ] **REQ-3:** WHEN multiple images have same person THE SYSTEM SHALL group faces together
- [ ] **REQ-4:** WHEN user clicks a face group THE SYSTEM SHALL show all images containing that person
- [ ] **REQ-5:** WHEN in AI Engine settings THE SYSTEM SHALL allow enabling/disabling face detection
- [ ] **REQ-6:** WHEN viewing an image THE SYSTEM SHALL show detected faces section

### Acceptance Criteria

- [ ] Face detection toggle in settings
- [ ] Detected faces shown as circular cutouts
- [ ] Face grouping clusters same person across images
- [ ] Face groups section in Library view
- [ ] Per-image face list in detail view
- [ ] Uses existing Photo Manager face detection if available

---

## Design

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Image Upload   │ ──▶ │  Face Detector   │ ──▶ │  Face Embeddings│
└─────────────────┘     │  (InsightFace)   │     │  (vectors)      │
                        └──────────────────┘     └────────┬────────┘
                                                         │
                        ┌──────────────────┐     ┌───────▼────────┐
                        │  Face Groups     │ ◀── │  Clustering    │
                        │  (UI display)    │     │  (similarity)  │
                        └──────────────────┘     └────────────────┘
```

### Face Groups UI

```
┌─────────────────────────────────────────────────────┐
│ Detected Faces                                      │
├─────────────────────────────────────────────────────┤
│  [👤]  Person 1 (5 photos)                         │
│  ○○○○○                                              │
│                                                     │
│  [👤]  Person 2 (3 photos)                         │
│  ○○○                                                │
│                                                     │
│  [👤]  Unknown (2 photos)                          │
│  ○○                                                 │
└─────────────────────────────────────────────────────┘
```

### Per-Image Face Display

```
┌─────────────────────────────────────────────────────┐
│ Faces in this image                                 │
├─────────────────────────────────────────────────────┤
│  [cutout1]  [cutout2]  [cutout3]                   │
│  Person 1   Unknown    Person 2                    │
│  [Name ▼]   [Name ▼]   [Name ▼]                   │
└─────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface DetectedFace {
  id: string
  imageId: string
  boundingBox: { x: number; y: number; width: number; height: number }
  embedding: number[]  // face vector for matching
  cutoutUrl: string    // cropped face image
  personId?: string    // assigned person group
}

interface FaceGroup {
  id: string
  name: string         // "Person 1" or custom name
  faceIds: string[]
  representativeFaceId: string  // best quality face for avatar
}
```

---

## Tasks

- [ ] **TASK-1:** Research Photo Manager face detection implementation
  - Path: `W:/manage/photo`
  - Check for InsightFace integration
- [ ] **TASK-2:** Add face detection toggle to Settings
- [ ] **TASK-3:** Integrate face detection on image upload
- [ ] **TASK-4:** Create face cutout extraction (crop bounding box)
- [ ] **TASK-5:** Implement face embedding storage
- [ ] **TASK-6:** Add face clustering/grouping algorithm
- [ ] **TASK-7:** Create FaceGroup UI component
- [ ] **TASK-8:** Add per-image faces display
- [ ] **TASK-9:** Allow naming face groups

---

## References

- Photo Manager: `W:/manage/photo/IMPLEMENTATION-PLAN.md`
- InsightFace: https://github.com/deepinsight/insightface
- Existing face detection in Photo: investigate `W:/manage/photo`

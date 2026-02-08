# Image Persistence - Requirements

## Overview
Keep uploaded images as thumbnails, persist references in localStorage.

## User Stories

### US-1: Accumulate Images
**As a** user
**I want to** add more images without losing previous ones
**So that** I can build up a collection to analyze

#### Acceptance Criteria
- WHEN user uploads new images THE SYSTEM SHALL add to existing collection
- WHEN page reloads THE SYSTEM SHALL restore previous images
- WHEN user clicks "Clear All" THE SYSTEM SHALL remove all images

### US-2: Thumbnail Display
**As a** user
**I want to** see images as small thumbnails
**So that** I can see many at once

#### Acceptance Criteria
- WHEN images are uploaded THE SYSTEM SHALL display as thumbnails
- WHEN thumbnail is clicked THE SYSTEM SHALL show full result card
- WHEN hovering thumbnail THE SYSTEM SHALL show filename tooltip

### US-3: Local Storage
**As a** user
**I want to** see my images after refresh
**So that** I don't lose my work

#### Acceptance Criteria
- WHEN image is added THE SYSTEM SHALL store reference in localStorage
- WHEN page loads THE SYSTEM SHALL restore from localStorage
- WHEN storage exceeds limit THE SYSTEM SHALL warn user

## Storage Schema
```typescript
interface StoredImage {
  id: string
  filename: string
  thumbnail: string  // base64 or blob URL
  result?: AnalysisResult
  batchId?: string
  addedAt: string
}
```

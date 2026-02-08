# Tag Editor - Requirements

## Overview
Allow users to edit extracted metadata tags with pill UI. Add/remove tags, then search for similar images on public domain sites and Google Images.

## User Stories

### US-1: View Tags as Pills
**As a** user viewing analysis results
**I want to** see extracted tags as small pill badges
**So that** I can quickly scan and manage metadata

#### Acceptance Criteria
- WHEN analysis completes THE SYSTEM SHALL display tags as pill badges
- WHEN viewing pills THE SYSTEM SHALL show X button on hover to remove
- WHEN multiple tags exist THE SYSTEM SHALL wrap pills to multiple lines

### US-2: Remove Tags
**As a** user
**I want to** remove unwanted tags by clicking X
**So that** I can refine the metadata

#### Acceptance Criteria
- WHEN clicking X on a pill THE SYSTEM SHALL remove that tag
- WHEN tag is removed THE SYSTEM SHALL update localStorage
- WHEN all tags removed THE SYSTEM SHALL show "No tags" placeholder

### US-3: Add Tags
**As a** user
**I want to** add custom tags manually
**So that** I can enhance the AI-generated metadata

#### Acceptance Criteria
- WHEN clicking "Add tag" THE SYSTEM SHALL show input field
- WHEN pressing Enter THE SYSTEM SHALL add the new tag as pill
- WHEN tag already exists THE SYSTEM SHALL prevent duplicate

### US-4: Search Similar Images
**As a** user with refined tags
**I want to** search for similar images on public domain sites
**So that** I can find related content

#### Acceptance Criteria
- WHEN clicking "Search" THE SYSTEM SHALL show search options dropdown
- WHEN selecting source THE SYSTEM SHALL open search in new tab
- WHEN searching THE SYSTEM SHALL use current tags as query

## Search Sources
- Google Images
- Unsplash
- Pexels
- Pixabay
- Wikimedia Commons
- Flickr (CC licensed)

## Tag Pill Schema
```typescript
interface TagPill {
  value: string
  source: 'ai' | 'user'  // distinguish AI vs manually added
  confidence?: number    // only for AI tags
}
```

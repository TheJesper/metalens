# Batch Grouping - Requirements

## Overview
Group multiple images into named batches displayed as folders.

## User Stories

### US-1: Create Batch
**As a** user with multiple images
**I want to** group them into a named batch
**So that** I can organize my analysis work

#### Acceptance Criteria
- WHEN user selects multiple images THE SYSTEM SHALL show "Create Batch" button
- WHEN user clicks create THE SYSTEM SHALL prompt for batch name
- WHEN batch is created THE SYSTEM SHALL display as folder icon

### US-2: View Batch
**As a** user
**I want to** expand/collapse batch folders
**So that** I can see contained images

#### Acceptance Criteria
- WHEN batch is collapsed THE SYSTEM SHALL show folder icon with count
- WHEN batch is expanded THE SYSTEM SHALL show contained thumbnails
- WHEN clicking batch THE SYSTEM SHALL toggle expand/collapse

### US-3: Manage Batches
**As a** user
**I want to** rename or delete batches
**So that** I can organize my work

#### Acceptance Criteria
- WHEN right-clicking batch THE SYSTEM SHALL show context menu
- WHEN renaming THE SYSTEM SHALL update batch name in storage
- WHEN deleting THE SYSTEM SHALL remove batch but keep images

## Batch Schema
```typescript
interface Batch {
  id: string
  name: string
  imageIds: string[]
  createdAt: string
  expanded: boolean
}
```

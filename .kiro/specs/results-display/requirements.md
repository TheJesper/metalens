# Results Display - Requirements

## Overview
Display analysis results in a visual grid with tags, colors, and metadata.

## User Stories

### US-1: Results Grid
**As a** user
**I want to** see analysis results in a card grid
**So that** I can quickly review multiple images

#### Acceptance Criteria
- WHEN analysis completes THE SYSTEM SHALL show result card with image preview
- WHEN viewing results THE SYSTEM SHALL display tags as badges
- WHEN viewing results THE SYSTEM SHALL show color palette as swatches
- WHEN viewing results THE SYSTEM SHALL show suggested title

### US-2: Processing Status
**As a** user
**I want to** see which images are still processing
**So that** I know the current progress

#### Acceptance Criteria
- WHEN image is pending THE SYSTEM SHALL show no status badge
- WHEN image is processing THE SYSTEM SHALL show spinning loader
- WHEN image is complete THE SYSTEM SHALL show green checkmark
- WHEN image has error THE SYSTEM SHALL show red error badge

### US-3: Batch Progress
**As a** user processing multiple images
**I want to** see overall progress
**So that** I know how much is left

#### Acceptance Criteria
- WHEN batch processing THE SYSTEM SHALL show progress bar
- WHEN batch processing THE SYSTEM SHALL show "X of Y" count
- WHEN batch complete THE SYSTEM SHALL hide progress bar

## Non-Functional Requirements
- NFR-1: Grid must be responsive (1-3 columns based on viewport)
- NFR-2: Image previews must use object-fit: cover
- NFR-3: Cards must animate in on completion

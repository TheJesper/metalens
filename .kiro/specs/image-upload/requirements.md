# Image Upload - Requirements

## Overview
Users can upload images for AI analysis via drag-and-drop or file picker.

## User Stories

### US-1: Single Image Upload
**As a** user
**I want to** upload a single image
**So that** I can analyze its metadata

#### Acceptance Criteria
- WHEN a user drags an image file onto the upload zone THE SYSTEM SHALL accept the file and show a preview
- WHEN a user clicks the upload zone THE SYSTEM SHALL open a file picker dialog
- WHEN a user selects a valid image (JPG, PNG, WebP, GIF) THE SYSTEM SHALL display the filename
- WHEN a user uploads an invalid file type THE SYSTEM SHALL reject it silently

### US-2: Multiple Image Upload
**As a** user
**I want to** upload multiple images at once
**So that** I can batch analyze them

#### Acceptance Criteria
- WHEN a user selects multiple images THE SYSTEM SHALL accept all valid files
- WHEN processing multiple images THE SYSTEM SHALL show individual progress per image
- WHEN all images are processed THE SYSTEM SHALL display results in a grid

### US-3: ZIP Archive Upload
**As a** user
**I want to** upload a ZIP file containing images
**So that** I can analyze many images conveniently

#### Acceptance Criteria
- WHEN a user uploads a .zip file THE SYSTEM SHALL extract images from the archive
- WHEN the ZIP contains non-image files THE SYSTEM SHALL ignore them
- WHEN extraction completes THE SYSTEM SHALL process each image

## Non-Functional Requirements
- NFR-1: Upload zone must be responsive (375px - 1920px)
- NFR-2: Drag state must provide visual feedback within 100ms
- NFR-3: File validation must complete before upload starts

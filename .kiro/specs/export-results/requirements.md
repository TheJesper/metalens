# Export Results - Requirements

## Overview
Users can export analysis results to JSON format for use in other tools.

## User Stories

### US-1: Export Single Result
**As a** user
**I want to** export a single image's analysis to JSON
**So that** I can use the data in other applications

#### Acceptance Criteria
- WHEN viewing a completed result THE SYSTEM SHALL show an export button
- WHEN user clicks export THE SYSTEM SHALL download a JSON file
- WHEN exported THE JSON SHALL contain all analysis fields

### US-2: Export All Results
**As a** user with multiple analyzed images
**I want to** export all results at once
**So that** I can batch process the metadata

#### Acceptance Criteria
- WHEN multiple images are analyzed THE SYSTEM SHALL show "Export All" button
- WHEN user clicks "Export All" THE SYSTEM SHALL download a JSON array
- WHEN exported THE filename SHALL include timestamp

## Non-Functional Requirements
- NFR-1: Export must work offline (client-side only)
- NFR-2: JSON must be pretty-printed for readability
- NFR-3: Filename format: metalens-export-{timestamp}.json

# Engine Selector - Requirements

## Overview
CoverKit-styled adapter/model selector with disabled states for unconfigured engines.

## User Stories

### US-1: Visual Engine Selection
**As a** user
**I want to** see a visually styled engine selector
**So that** I can easily choose my preferred AI provider

#### Acceptance Criteria
- WHEN viewing selector THE SYSTEM SHALL show CoverKit-styled dropdown
- WHEN adapter has no API key THE SYSTEM SHALL show disabled state with "API Key Required"
- WHEN Ollama is selected THE SYSTEM SHALL be enabled by default (no key needed)

### US-2: Re-analyze on Engine Change
**As a** user with existing results
**I want to** re-run analysis when I switch engines
**So that** I can compare results across providers

#### Acceptance Criteria
- WHEN user changes engine with existing results THE SYSTEM SHALL show "Re-analyze" button
- WHEN user clicks re-analyze THE SYSTEM SHALL process all images with new engine
- WHEN re-analyzing THE SYSTEM SHALL preserve original thumbnails

### US-3: API Key Configuration
**As a** user with API keys
**I want to** enter my keys to enable adapters
**So that** I can use paid vision services

#### Acceptance Criteria
- WHEN adapter is disabled THE SYSTEM SHALL show "Configure" button
- WHEN user enters valid key THE SYSTEM SHALL enable the adapter
- WHEN key is entered THE SYSTEM SHALL NOT persist it (session only)

## Adapter States
| Adapter | Default State | Enable Condition |
|---------|---------------|------------------|
| Mock | Enabled | Always |
| Ollama | Enabled | Server reachable |
| OpenAI | Disabled | API key provided |
| Claude | Disabled | API key provided |
| Google | Disabled | API key provided |

# Vision Adapters - Requirements

## Overview
Pluggable AI vision providers for image analysis with unified interface.

## User Stories

### US-1: Select Vision Provider
**As a** user
**I want to** choose which AI provider analyzes my images
**So that** I can use my preferred service or API keys

#### Acceptance Criteria
- WHEN the page loads THE SYSTEM SHALL default to Mock adapter
- WHEN a user selects a different adapter THE SYSTEM SHALL update the model dropdown
- WHEN a user has no API key for a paid adapter THE SYSTEM SHALL show a warning

### US-2: Mock Analysis (Demo)
**As a** user without API keys
**I want to** try the demo with mock data
**So that** I can understand the tool before committing

#### Acceptance Criteria
- WHEN using Mock adapter THE SYSTEM SHALL return realistic fake analysis
- WHEN mock analyzing THE SYSTEM SHALL simulate 1-2 second delay
- WHEN mock completes THE SYSTEM SHALL return tags, colors, mood, objects

### US-3: OpenAI Vision
**As a** user with OpenAI API key
**I want to** use GPT-4o for analysis
**So that** I get high-quality results

#### Acceptance Criteria
- WHEN OpenAI is selected THE SYSTEM SHALL show gpt-4o and gpt-4o-mini models
- WHEN analyzing THE SYSTEM SHALL send image as base64 to OpenAI API
- WHEN API returns THE SYSTEM SHALL parse JSON response into AnalysisResult

### US-4: Claude Vision
**As a** user with Anthropic API key
**I want to** use Claude for analysis
**So that** I can leverage Anthropic's vision capabilities

#### Acceptance Criteria
- WHEN Claude is selected THE SYSTEM SHALL show claude-3-5-sonnet and claude-3-haiku
- WHEN analyzing THE SYSTEM SHALL use Anthropic messages API with image content

### US-5: Ollama Local
**As a** privacy-conscious user
**I want to** use local Ollama models
**So that** my images never leave my machine

#### Acceptance Criteria
- WHEN Ollama is selected THE SYSTEM SHALL allow localhost or tunnel URL
- WHEN analyzing THE SYSTEM SHALL call Ollama generate API with image
- WHEN Ollama is unreachable THE SYSTEM SHALL show connection error

## Non-Functional Requirements
- NFR-1: Adapter interface must be extensible for new providers
- NFR-2: API keys must never be logged or persisted
- NFR-3: Timeout for API calls: 60 seconds

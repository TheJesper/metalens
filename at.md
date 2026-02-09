# MetaLens - Active Tasks

> Standards: [Golden Rules](W:\workprocess\_agent-orchestration\process\standards\GOLDEN-RULES-MASTER.md)
> Task format: `- [ ] META-XXX: Description`

## Current Sprint (UX Fixes) - COMPLETED

### SPEC-META-001: Upload Flow UX ✓
> Spec: `docs/specs/ux/upload-flow/SPEC-META-001.md`

- [x] META-040: Move progress bar inside drop zone (no vertical layout shift)
- [x] META-041: Rename "Upload" section → "AI Vision Analysis"
- [x] META-042: Auto-analyze on file upload (remove manual trigger need)
- [x] META-043: Show "Re-analyze" button only after first analysis complete
- [x] META-044: Style file picker as centered CoverKit gold button
- [x] META-045: Change "Clear All" to ghost/subtle variant
- [x] META-046: Add inline error messages with retry option

### SPEC-META-002: Metadata Display UX ✓
> Spec: `docs/specs/ux/metadata-display/SPEC-META-002.md`

- [x] META-050: Tags as interactive pills with X remove button
- [x] META-051: "+ Add Tag" button with manual tag entry
- [x] META-052: "Copy All" button (JSON to clipboard)
- [x] META-053: Google search action per tag
- [x] META-054: Public domain search (Unsplash/Pexels/Wikimedia)
- [x] META-055: Increase font sizes (body 14px, labels 12px min)
- [x] META-056: Fix description indentation issue
- [x] META-057: Color swatches with hex/name display

## Next Sprint (Features)

### SPEC-META-003: Face Detection Integration
> Spec: `docs/specs/features/face-detection/SPEC-META-003.md`

- [ ] META-060: Research Photo Manager face detection implementation
- [ ] META-061: Add face detection toggle to Settings
- [ ] META-062: Integrate face detection on image upload
- [ ] META-063: Create face cutout extraction (crop bounding box)
- [ ] META-064: Implement face embedding storage
- [ ] META-065: Add face clustering/grouping algorithm
- [ ] META-066: Create FaceGroup UI component
- [ ] META-067: Add per-image faces display
- [ ] META-068: Allow naming face groups

### SPEC-META-004: Sketch to Mermaid
> Spec: `docs/specs/features/sketch-to-mermaid/SPEC-META-004.md`

- [x] META-070: Rename "Draw → Mermaid 2" to "Sketch → Mermaid Diagram"
- [x] META-071: Add proper description subtitle
- [ ] META-072: Implement canvas drawing component
- [ ] META-073: Create Mermaid JSON schema for structured AI output
- [ ] META-074: Implement AI recognition with structured JSON
- [ ] META-075: Add Mermaid code display with copy button
- [ ] META-076: Add live Mermaid preview renderer
- [ ] META-077: Add clear canvas button

## Backlog

- [ ] META-012: Export metadata to JSON file
- [ ] META-020: EXIF data extraction
- [ ] META-021: Batch folder display with expand/collapse
- [ ] META-022: Batch context menu (rename/delete)
- [ ] META-023: OpenAI/Claude/Google adapters
- [ ] META-080: CoverKit consistency audit (buttons, spacing, colors, typography)

## Completed

- [x] META-010: Implement Ollama adapter (vision analysis via localhost:11434)
- [x] META-001: Set up Vite + React + TypeScript project
- [x] META-002: Install and configure CoverKit (@covers/ui)
- [x] META-003: Create upload dropzone
- [x] META-004: Create Demo Area with mock AI metadata display
- [x] META-005: B2B layout with CoverKit Sidebar
- [x] META-006: Image persistence in localStorage
- [x] META-007: Thumbnail grid with selection mode
- [x] META-008: Batch creation dialog
- [x] META-009: Engine selector with status indicators
- [x] META-011: Tag editor with pills (add/remove tags, search similar images)
- [x] META-015: Match Covers layout (icon rail 48px, explorer 288px, header 60px, footer 24px)
- [x] META-016: Image chat feature (chat about images with AI)
- [x] META-017: Drag & drop with extension-based file detection
- [x] META-040 to META-046: Upload Flow UX (SPEC-META-001)
- [x] META-050 to META-057: Metadata Display UX (SPEC-META-002)
- [x] META-070: Sketch section renamed
- [x] META-071: Sketch subtitle added

---

*Updated: 2026-02-09*

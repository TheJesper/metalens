# SPEC-META-001: Upload Flow UX Improvements

> **Status:** draft
> **Created:** 2026-02-09
> **Updated:** 2026-02-09

---

## Requirements

### Stories

- [ ] **REQ-1:** WHEN user uploads images THE SYSTEM SHALL show progress inside the drop zone (no vertical layout shift)
- [ ] **REQ-2:** WHEN user lands on the app THE SYSTEM SHALL show "Metadata Extraction" or "AI Analysis" section (not generic "Upload")
- [ ] **REQ-3:** WHEN user uploads an image THE SYSTEM SHALL automatically start analysis (no separate button needed)
- [ ] **REQ-4:** WHEN analysis fails THE SYSTEM SHALL show clear error message with retry option
- [ ] **REQ-5:** WHEN no analysis has run THE SYSTEM SHALL NOT show "Re-analyze" button (confusing UX)
- [ ] **REQ-6:** WHEN user clicks file picker THE SYSTEM SHALL use CoverKit-styled button (centered, gold variant)

### Acceptance Criteria

- [ ] Page does not flicker/shift vertically when adding images
- [ ] Progress indicator is contained within drop zone area
- [ ] Section header says "Metadata Extraction" or "AI Vision Analysis"
- [ ] Images auto-analyze on upload
- [ ] Error messages appear inline with retry option
- [ ] "Re-analyze" only appears after first analysis complete
- [ ] File picker button matches CoverKit gold button style, centered
- [ ] "Clear All" button uses subtle/ghost variant (not red/destructive prominence)

---

## Design

### Current Problems

| Issue | Impact |
|-------|--------|
| Progress card appears below drop zone | Layout shift, flickering |
| "Upload" label is generic | Not user-focused |
| "Re-analyze" shown before first analysis | Confusing |
| "Clear All" red/prominent | Visual noise |
| File input left-aligned, native style | Inconsistent with CoverKit |
| No error feedback on upload failure | No transparency |

### Proposed Solution

```
┌─────────────────────────────────────────┐
│  AI Vision Analysis                     │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │     [Icon]                        │  │
│  │     Drop images to analyze        │  │
│  │     ─────────────────────────     │  │
│  │     [████████░░░░] 60% (3/5)      │  │  ← Progress INSIDE drop zone
│  │     ─────────────────────────     │  │
│  │     [ Choose Files ]  (centered)  │  │  ← CoverKit gold button
│  └───────────────────────────────────┘  │
│                                         │
│  Recent: [thumb] [thumb] [thumb]  [···] │  ← Horizontal, no shift
└─────────────────────────────────────────┘
```

### Button States

| State | "Re-analyze" | "Clear" |
|-------|--------------|---------|
| No images | Hidden | Hidden |
| Images, no results | Hidden | Ghost/subtle |
| Images with results | Visible (outline) | Ghost/subtle |

---

## Tasks

- [ ] **TASK-1:** Move progress bar inside drop zone Card
- [ ] **TASK-2:** Rename section from "Upload" to "AI Vision Analysis"
- [ ] **TASK-3:** Auto-analyze on file upload (remove manual trigger)
- [ ] **TASK-4:** Conditionally show Re-analyze button (only after results exist)
- [ ] **TASK-5:** Style file picker as centered CoverKit gold button
- [ ] **TASK-6:** Change "Clear All" to ghost/subtle variant
- [ ] **TASK-7:** Add inline error messages with retry

---

## References

- CoverKit components: `W:/code/covers/packages/ui`
- Current App.tsx: `W:/code/metalens/src/App.tsx`

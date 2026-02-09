# SPEC-META-002: Metadata Display UX

> **Status:** draft
> **Created:** 2026-02-09
> **Updated:** 2026-02-09

---

## Requirements

### Stories

- [ ] **REQ-1:** WHEN viewing image metadata THE SYSTEM SHALL display tags as interactive pills (not tiny text)
- [ ] **REQ-2:** WHEN user clicks a tag pill X THE SYSTEM SHALL remove that tag
- [ ] **REQ-3:** WHEN user clicks "+ Add Tag" THE SYSTEM SHALL allow manual tag entry
- [ ] **REQ-4:** WHEN user clicks "Copy" THE SYSTEM SHALL copy all metadata as JSON to clipboard
- [ ] **REQ-5:** WHEN user clicks Google icon on tag THE SYSTEM SHALL open Google image search for that tag
- [ ] **REQ-6:** WHEN user clicks public domain icon THE SYSTEM SHALL search Unsplash/Pexels/Wikimedia
- [ ] **REQ-7:** WHEN displaying metadata THE SYSTEM SHALL use readable font sizes (min 14px body, 12px labels)
- [ ] **REQ-8:** WHEN displaying description/clip art text THE SYSTEM SHALL NOT indent unexpectedly

### Acceptance Criteria

- [ ] Tags displayed as pills with X remove button
- [ ] "+ Add" button to manually add tags
- [ ] "Copy All" button copies structured JSON
- [ ] Each tag has hover action for Google search
- [ ] Public domain search button available
- [ ] Body text minimum 14px, labels minimum 12px
- [ ] No unexpected indentation in descriptions
- [ ] Colors displayed as swatches with hex/name

---

## Design

### Tag Pills Component

```
┌─────────────────────────────────────────────────────┐
│ Tags                                    [Copy All]  │
├─────────────────────────────────────────────────────┤
│ [clip art ×] [cartoon ×] [humor ×] [pixel art ×]   │
│ [Microsoft Excel ×] [+ Add]                         │
│                                                     │
│ 🔍 Google  |  📷 Unsplash  |  🌐 Wikimedia         │
└─────────────────────────────────────────────────────┘
```

### Metadata Card Layout

```
┌─────────────────────────────────────────────────────┐
│ [Image]  │  Title: Excel on Vacation               │
│  150px   │  ─────────────────────────────────────  │
│          │  Description (14px, readable)            │
│          │  A humorous image featuring...           │
│          │  ─────────────────────────────────────  │
│          │  Tags: [pill] [pill] [pill] [+ Add]     │
│          │  ─────────────────────────────────────  │
│          │  Colors: [■ #FF5733 Orange 30%]         │
│          │  Mood: Playful  |  Scene: Office humor  │
├──────────┴──────────────────────────────────────────┤
│ [📋 Copy JSON]  [🔍 Google]  [📷 Stock Search]     │
└─────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface TagPill {
  label: string
  removable: boolean
  searchable: boolean
}

interface MetadataActions {
  copyAsJson(): void
  searchGoogle(query: string): void
  searchPublicDomain(query: string): void
  addTag(tag: string): void
  removeTag(tag: string): void
}
```

---

## Tasks

- [ ] **TASK-1:** Create TagPill component with X remove button
- [ ] **TASK-2:** Add "+ Add Tag" functionality with input
- [ ] **TASK-3:** Add "Copy All" button (JSON to clipboard)
- [ ] **TASK-4:** Add Google search action per tag/all tags
- [ ] **TASK-5:** Add public domain search (Unsplash/Pexels/Wikimedia)
- [ ] **TASK-6:** Increase font sizes (body 14px, labels 12px min)
- [ ] **TASK-7:** Fix description indentation issue
- [ ] **TASK-8:** Display colors as visual swatches

---

## References

- CoverKit Badge component: `@covers/ui`
- Current display: `W:/code/metalens/src/App.tsx` (lines 745-777)

# SPEC-META-001: Project System

## Status: draft

## Problem / Feature Request
MetaLens has no project organization. Users working on multiple clients/jobs cannot separate their work. Needs project sidebar like Covers for professional demo.

## Requirements
- [ ] Projects sidebar (collapsible, left panel)
- [ ] Create/edit/delete projects
- [ ] Project has: name, icon, color, settings
- [ ] Switch between projects
- [ ] Images belong to active project
- [ ] Persist projects to localStorage

## Implementation Notes
- Reuse sidebar pattern from Covers
- Project settings: target keywords, language, model
- Default project "All Images" for ungrouped

## Test Criteria
- [ ] Can create project with name/icon
- [ ] Switching project filters images
- [ ] Projects persist after refresh
- [ ] Sidebar collapses/expands

## References
- Related specs: SPEC-META-002, SPEC-META-003
- Covers sidebar: `src/components/layout/`

# SPEC-META-002: Batch Themes & Aggregation

## Status: draft

## Problem / Feature Request
When processing many images, users can't see patterns across the batch. Need to aggregate keywords and detect themes automatically.

## Requirements
- [ ] Batch summary shows aggregated keywords
- [ ] Keyword frequency count (e.g., "sunset: 47 images")
- [ ] Top 10 themes per batch
- [ ] Filter batch by keyword presence

## Implementation Notes
- Calculate after batch processing completes
- Show in batch detail sidebar
- Theme = keyword appearing in >30% of images

## Test Criteria
- [ ] Batch of 10 images shows aggregated keywords
- [ ] Clicking keyword filters to matching images
- [ ] Theme detection works

## References
- Related specs: SPEC-META-001

# SPEC-META-003: Settings Panel

## Status: draft

## Problem / Feature Request
No way to configure analysis behavior. Users need control over keyword count, language, and defaults.

## Requirements
- [ ] Target keywords slider (5-20)
- [ ] Output language selector (EN, SV, DE, ES, FR, auto)
- [ ] Default model selection
- [ ] Export format preference (CSV, JSON)
- [ ] Settings persist per-project

## Implementation Notes
- Settings view already exists, needs expansion
- Project-level settings override global

## Test Criteria
- [ ] Changing target keywords affects analysis output
- [ ] Language setting produces localized keywords
- [ ] Settings persist after refresh

## References
- Related specs: SPEC-META-001

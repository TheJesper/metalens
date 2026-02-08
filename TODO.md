# MetaLens TODO

## Local Ollama Integration

MetaLens can call local Ollama via the pull-based job queue. See full docs: `W:\code\covers\docs\OLLAMA-LOCAL-EXECUTION.md`

**Quick start:**
1. Run Ollama: `ollama serve` (localhost:11434)
2. Start cafe-poller on local machine:
   ```bash
   cd W:/workprocess/agent-cafe
   MONGODB_URI="mongodb://..." TRIGGER_HMAC_SECRET="..." npm run poller
   ```
3. MetaLens submits jobs via `POST /api/trigger`
4. Poller executes locally, writes results to MongoDB
5. MetaLens polls for results

**Available commands:** `ollama-analyze`, `ollama-chat`, `ollama-embed`

---

## Backlog

### Replace native selects with CoverKit Select components
- [ ] Find all `<select>` elements in src/
- [ ] Replace with `Select, SelectTrigger, SelectValue, SelectContent, SelectItem` from `@covers/ui`
- [ ] Ensure dark mode styling matches rest of app

**Components available:**
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@covers/ui'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Dependencies:** Already installed in package.json

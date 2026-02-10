import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-lib'
import { ADAPTERS, ADAPTER_MODELS, AdapterType } from '../lib/adapters'

interface AdapterSelectProps {
  adapter: AdapterType
  model: string
  onAdapterChange: (adapter: AdapterType) => void
  onModelChange: (model: string) => void
}

export function AdapterSelect({
  adapter,
  model,
  onAdapterChange,
  onModelChange,
}: AdapterSelectProps) {
  const models = ADAPTER_MODELS[adapter]

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm text-muted-foreground mb-2 block">
          Vision Provider
        </label>
        <Select value={adapter} onValueChange={(v) => onAdapterChange(v as AdapterType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select adapter" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ADAPTERS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm text-muted-foreground mb-2 block">
          Model
        </label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

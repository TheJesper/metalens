import { Card, CardContent, Badge, cn } from '@/ui-lib'
import { User, Trash2 } from 'lucide-react'
import { Person, getFacesForPerson } from '../lib/faces'

interface PersonBucketProps {
  person: Person
  onClick: () => void
  onDelete: () => void
}

export function PersonBucket({ person, onClick, onDelete }: PersonBucketProps) {
  const faces = getFacesForPerson(person.id)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{person.name}</h3>
              <p className="text-xs text-muted-foreground">
                {faces.length} {faces.length === 1 ? 'face' : 'faces'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
            title="Delete person"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Face Grid Preview */}
        <div className="grid grid-cols-4 gap-1">
          {faces.slice(0, 8).map((face) => (
            <div
              key={face.id}
              className="aspect-square rounded bg-secondary flex items-center justify-center"
            >
              <User className="h-3 w-3 text-muted-foreground/50" />
            </div>
          ))}
          {faces.length === 0 && (
            <div className="col-span-4 aspect-square rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No faces</p>
            </div>
          )}
          {faces.length > 8 && (
            <div className="aspect-square rounded bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">+{faces.length - 8}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          Created {new Date(person.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

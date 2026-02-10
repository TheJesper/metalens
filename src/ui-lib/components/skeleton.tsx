import * as React from 'react'
import { cn } from '../utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the pulse animation
   * @default true
   */
  animate?: boolean
}

/**
 * Skeleton - Loading placeholder component
 *
 * Used to show a placeholder while content is loading.
 * Supports different shapes via className (rounded-full for circles, etc.)
 *
 * @example
 * // Basic usage
 * <Skeleton className="h-4 w-[200px]" />
 *
 * // Circle avatar placeholder
 * <Skeleton className="h-12 w-12 rounded-full" />
 *
 * // Card placeholder
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 * </div>
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md bg-muted',
          animate && 'animate-pulse',
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

export { Skeleton }

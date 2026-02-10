import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

/**
 * AspectRatio - Maintains consistent width-to-height ratio
 *
 * Displays content within a desired ratio, useful for images,
 * videos, and other media that should maintain proportions.
 *
 * @example
 * // 16:9 video container
 * <AspectRatio ratio={16 / 9}>
 *   <img src="..." className="object-cover w-full h-full" />
 * </AspectRatio>
 *
 * // Square container
 * <AspectRatio ratio={1}>
 *   <div className="bg-muted flex items-center justify-center">
 *     Square content
 *   </div>
 * </AspectRatio>
 *
 * // 4:3 image
 * <AspectRatio ratio={4 / 3}>
 *   <img src="..." alt="..." className="object-cover" />
 * </AspectRatio>
 */
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }

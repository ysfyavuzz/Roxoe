import { SyntheticEvent } from 'react';

/**
 * Custom hook that provides a reusable image error handler.
 * When an image fails to load (404, network error, etc.),
 * this handler hides the broken image element by setting display to 'none'.
 * 
 * @returns A function to be used as the onError handler for <img> elements
 * 
 * @example
 * ```tsx
 * const handleImageError = useImageErrorHandler();
 * 
 * <img 
 *   src={imageSrc} 
 *   alt="Product" 
 *   onError={handleImageError}
 * />
 * ```
 */
export function useImageErrorHandler() {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = 'none';
  };
}

export function getPosterUrl(
  posterPath: string | null,
  size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  if (!posterPath) return '/placeholder-poster.svg'
  return `https://image.tmdb.org/t/p/${size}${posterPath}`
}

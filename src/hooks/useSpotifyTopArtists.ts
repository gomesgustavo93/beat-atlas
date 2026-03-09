import { useQuery } from '@tanstack/react-query'
import { getTopArtists } from '../services/spotifyApi'
import type { IArtist } from '../types/spotify'

interface ITopArtistsResponse {
  items: IArtist[]
  total: number
  limit: number
  offset: number
  href: string
  next: string | null
  previous: string | null
}

export const useSpotifyTopArtists = (
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery<ITopArtistsResponse, Error>({
    queryKey: ['top-artists', timeRange, limit, offset],
    queryFn: () => getTopArtists(timeRange, limit, offset),
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getTopTracks } from '../services/spotifyApi'
import type { ITrack } from '../types/spotify'

interface ITopTracksResponse {
  items: ITrack[]
  total: number
  limit: number
  offset: number
  href: string
  next: string | null
  previous: string | null
}

export const useSpotifyTopTracks = (
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery<ITopTracksResponse, Error>({
    queryKey: ['top-tracks', timeRange, limit, offset],
    queryFn: () => getTopTracks(timeRange, limit, offset),
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getFollowedArtists } from '../services/spotifyApi'
import type { IArtist } from '../types/spotify'

interface IFollowedArtistsResponse {
  items: IArtist[]
  total: number
  cursors: {
    after: string | null
  }
}

export const useSpotifyFollowedArtists = (
  limit: number = 20,
  after?: string
) => {
  return useQuery<IFollowedArtistsResponse, Error>({
    queryKey: ['followed-artists', limit, after],
    queryFn: () => getFollowedArtists(limit, after),
    retry: false,
  })
}

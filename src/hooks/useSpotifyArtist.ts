import { useQuery } from '@tanstack/react-query'
import { getArtistById } from '../services/spotifyApi'
import type { IArtist } from '../types/spotify'

export const useSpotifyArtist = (artistId: string | null) => {
  return useQuery<IArtist, Error>({
    queryKey: ['artist', artistId],
    queryFn: () => {
      if (!artistId) {
        throw new Error('Artist ID is required')
      }
      return getArtistById(artistId)
    },
    enabled: !!artistId,
  })
}

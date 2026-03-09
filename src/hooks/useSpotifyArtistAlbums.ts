import { useQuery } from '@tanstack/react-query'
import { getArtistAlbums } from '../services/spotifyApi'
import type { IAlbum } from '../types/spotify'

interface IArtistAlbumsResponse {
  items: IAlbum[]
  total: number
  limit: number
  offset: number
  href: string
  next: string | null
  previous: string | null
}

export const useSpotifyArtistAlbums = (
  artistId: string | null,
  limit: number = 10,
  offset: number = 0
) => {
  return useQuery<IArtistAlbumsResponse, Error>({
    queryKey: ['artist-albums', artistId, limit, offset],
    queryFn: () => {
      if (!artistId) {
        throw new Error('Artist ID is required')
      }
      return getArtistAlbums(artistId, limit, offset)
    },
    enabled: !!artistId,
  })
}

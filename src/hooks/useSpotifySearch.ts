import { useQuery } from '@tanstack/react-query'
import { getSearch } from '../services/spotifyApi'
import type { IAlbum, IArtist, ITrack } from '../types/spotify'

interface ISearchResponse {
  artists?: {
    items: IArtist[]
    total: number
    limit: number
    offset: number
  }
  tracks?: {
    items: ITrack[]
    total: number
    limit: number
    offset: number
  }
  albums?: {
    items: IAlbum[]
    total: number
    limit: number
    offset: number
  }
}

export const useSpotifySearch = (
  query: string,
  types: string[] = ['artist'],
  limit: number = 10,
  offset: number = 0,
  enabled: boolean = true
) => {
  const typeString = types.length > 0 ? types.join(',') : 'artist'

  return useQuery<ISearchResponse, Error>({
    queryKey: ['search', query, types.join(','), limit, offset],
    queryFn: () => getSearch(query, typeString, limit, offset),
    enabled: enabled && !!query && query.trim().length > 0 && types.length > 0,
    staleTime: 1000 * 60 * 2,
  })
}

import userHttpClient from '../configs/userHttpClient/userHttpClient'
import type { IArtist, ITrack, IAlbum } from '../types/spotify'

export async function getArtistById(artistId: string): Promise<IArtist> {
  const response = await userHttpClient.get<IArtist>(`/artists/${artistId}`)
  return response.data
}

export async function getSearch(
  query: string,
  type: string,
  limit: number = 10,
  offset: number = 0
) {
  const validLimit = Math.min(Math.max(1, Math.floor(Number(limit))), 50)
  const validOffset = Math.max(0, Math.floor(Number(offset)))

  const response = await userHttpClient.get('/search', {
    params: {
      q: query,
      type: type,
      limit: validLimit,
      offset: validOffset,
    },
  })
  return response.data
}

export async function getArtistAlbums(
  artistId: string,
  limit: number = 10,
  offset: number = 0
) {
  const validLimit = Math.min(Math.max(1, Math.floor(Number(limit))), 50)
  const validOffset = Math.max(0, Math.floor(Number(offset)))

  const response = await userHttpClient.get<{
    items: IAlbum[]
    total: number
    limit: number
    offset: number
    href: string
    next: string | null
    previous: string | null
  }>(`/artists/${artistId}/albums`, {
    params: {
      include_groups: 'album,single,compilation',
      limit: validLimit,
      offset: validOffset,
    },
  })
  return response.data
}

export async function getFollowedArtists(limit: number = 20, after?: string) {
  const response = await userHttpClient.get<{
    artists: {
      items: IArtist[]
      total: number
      cursors: {
        after: string | null
      }
    }
  }>('/me/following', {
    params: {
      type: 'artist',
      limit,
      after,
    },
  })
  return response.data.artists
}

export async function getTopItems(
  type: 'artists' | 'tracks',
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
) {
  const response = await userHttpClient.get<{
    items: IArtist[] | ITrack[]
    total: number
    limit: number
    offset: number
    href: string
    next: string | null
    previous: string | null
  }>(`/me/top/${type}`, {
    params: {
      time_range: timeRange,
      limit,
      offset,
    },
  })
  return response.data
}

export async function getTopArtists(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
) {
  return getTopItems('artists', timeRange, limit, offset) as Promise<{
    items: IArtist[]
    total: number
    limit: number
    offset: number
    href: string
    next: string | null
    previous: string | null
  }>
}

export async function getTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
) {
  return getTopItems('tracks', timeRange, limit, offset) as Promise<{
    items: ITrack[]
    total: number
    limit: number
    offset: number
    href: string
    next: string | null
    previous: string | null
  }>
}

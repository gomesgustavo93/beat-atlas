export interface IArtist {
  id: string
  name: string
  external_urls: {
    spotify: string
  }
  images: Array<{
    url: string
    height: number
    width: number
  }>
  type: string
  uri: string
}

export interface ITrack {
  id: string
  name: string
  artists: IArtist[]
  album: {
    id: string
    name: string
    images: Array<{
      url: string
      height: number
      width: number
    }>
  }
  external_urls: {
    spotify: string
  }
  preview_url: string | null
  duration_ms: number
  popularity: number
}

export interface IAlbum {
  id: string
  name: string
  artists: IArtist[]
  images: Array<{
    url: string
    height: number
    width: number
  }>
  external_urls: {
    spotify: string
  }
  release_date: string
  total_tracks: number
  type: string
}

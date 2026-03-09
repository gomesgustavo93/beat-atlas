import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Search from '../../components/InputSearch/InputSearch'
import { useSpotifySearch } from '../../hooks'
import Pagination from '../../components/Pagination/Pagination'
import CardArtist from '../../components/CardArtist/CardArtist'
import { cn } from '../../utils/cn'
import type { IArtist, ITrack, IAlbum } from '../../types/spotify'
import NavCards from '../../components/NavCards/NavCards'
import { Music2 } from 'lucide-react'
import { Container } from '../../components'
import MusicItem from '../../components/MusicItem'
import CardAlbum from '../../components/CardAlbum/CardAlbum'

const SEARCH_ITEMS_PER_PAGE = 10

function Home() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['artist'])
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [showCustomCursor, setShowCustomCursor] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  const [artistsPage, setArtistsPage] = useState(1)
  const [tracksPage, setTracksPage] = useState(1)
  const [albumsPage, setAlbumsPage] = useState(1)

  const artistsOffset = (artistsPage - 1) * SEARCH_ITEMS_PER_PAGE
  const tracksOffset = (tracksPage - 1) * SEARCH_ITEMS_PER_PAGE
  const albumsOffset = (albumsPage - 1) * SEARCH_ITEMS_PER_PAGE

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setArtistsPage(1)
      setTracksPage(1)
      setAlbumsPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleTypesChange = (types: string[]) => {
    setSelectedTypes(types)
    setArtistsPage(1)
    setTracksPage(1)
    setAlbumsPage(1)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect()
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        if (isInside) {
          setShowCustomCursor(true)
          setCursorPosition({ x: e.clientX, y: e.clientY })
        } else {
          setShowCustomCursor(false)
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const {
    data: artistsData,
    isLoading: isLoadingArtists,
    error: artistsError,
  } = useSpotifySearch(
    debouncedQuery,
    ['artist'],
    SEARCH_ITEMS_PER_PAGE,
    artistsOffset,
    selectedTypes.includes('artist')
  )

  const {
    data: tracksData,
    isLoading: isLoadingTracks,
    error: tracksError,
  } = useSpotifySearch(
    debouncedQuery,
    ['track'],
    SEARCH_ITEMS_PER_PAGE,
    tracksOffset,
    selectedTypes.includes('track')
  )

  const {
    data: albumsData,
    isLoading: isLoadingAlbums,
    error: albumsError,
  } = useSpotifySearch(
    debouncedQuery,
    ['album'],
    SEARCH_ITEMS_PER_PAGE,
    albumsOffset,
    selectedTypes.includes('album')
  )

  const searchData = {
    artists: artistsData?.artists,
    tracks: tracksData?.tracks,
    albums: albumsData?.albums,
  }

  const isSearchLoading = isLoadingArtists || isLoadingTracks || isLoadingAlbums
  const searchError = artistsError || tracksError || albumsError

  return (
    <Container>
      <div className={cn('max-w-7xl', 'mx-auto', 'pt-6')}>
        <div
          ref={titleRef}
          className={cn('text-center', 'mb-10', 'cursor-none')}
        >
          <div
            className={cn(
              'flex',
              'items-center',
              'justify-center',
              'gap-2',
              'flex-wrap'
            )}
          >
            <h1 className={cn('text-5xl', 'mb-3', 'font-bold', 'text-center')}>
              {t('home.welcomeTitle')}
              &nbsp;
              <span
                className={cn(
                  'bg-gradient-to-r',
                  'from-green-500',
                  'via-emerald-400',
                  'to-green-600',
                  'bg-clip-text',
                  'text-transparent',
                  'animate-pulse',
                  'drop-shadow-lg'
                )}
              >
                BeatAtlas
              </span>
            </h1>
            <Music2
              className={cn(
                'w-14',
                'h-14',
                'text-green-500',
                'animate-bounce',
                'drop-shadow-lg'
              )}
            />
          </div>
          <p
            className={cn(
              'text-xl',
              'text-gray-600',
              'dark:text-gray-300',
              'max-w-2xl',
              'mx-auto'
            )}
          >
            {t('home.welcomeMessage')}
          </p>

          {/* Cursor customizado */}
          {showCustomCursor && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: `${cursorPosition.x}px`,
                top: `${cursorPosition.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Music2 className="w-6 h-6 text-green-500" />
            </div>
          )}
        </div>

        <NavCards />

        <div className="mb-8">
          <Search
            query={searchQuery}
            selectedTypes={selectedTypes}
            onQueryChange={setSearchQuery}
            onTypesChange={handleTypesChange}
            isLoading={isSearchLoading}
            error={searchError}
          />
        </div>

        {debouncedQuery.trim().length > 0 && (
          <div className="mb-0">
            <h2 className="mb-5">{t('home.searchResults.title')}</h2>

            {isSearchLoading && (
              <div className={cn('text-center', 'py-10')}>
                <p>{t('home.searchResults.loading')}</p>
              </div>
            )}

            {searchError && (
              <div
                className={cn(
                  'text-red-600',
                  'my-5',
                  'p-4',
                  'bg-red-50',
                  'rounded-lg'
                )}
              >
                <strong>{t('home.searchResults.error')}:</strong>{' '}
                {searchError.message}
              </div>
            )}

            {!isSearchLoading && !searchError && searchData && (
              <>
                {selectedTypes.includes('artist') &&
                  searchData.artists &&
                  searchData.artists.items &&
                  searchData.artists.items.length > 0 && (
                    <div className="mb-10">
                      <h3 className={cn('mb-4', 'text-xl')}>
                        {t('home.searchResults.artists')}
                      </h3>
                      <div
                        className={cn(
                          'grid',
                          'grid-cols-2',
                          'sm:grid-cols-3',
                          'md:grid-cols-4',
                          'lg:grid-cols-5',
                          'gap-5',
                          'mb-5'
                        )}
                      >
                        {searchData.artists.items.map((artist: IArtist) => (
                          <CardArtist
                            key={artist.id}
                            artist={artist}
                            showButton={true}
                          />
                        ))}
                      </div>
                      {searchData.artists.total > SEARCH_ITEMS_PER_PAGE && (
                        <Pagination
                          currentPage={artistsPage}
                          totalPages={Math.ceil(
                            searchData.artists.total / SEARCH_ITEMS_PER_PAGE
                          )}
                          onPageChange={page => {
                            setArtistsPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          limit={SEARCH_ITEMS_PER_PAGE}
                          total={searchData.artists.total}
                        />
                      )}
                    </div>
                  )}

                {selectedTypes.includes('track') &&
                  searchData.tracks &&
                  searchData.tracks.items &&
                  searchData.tracks.items.length > 0 && (
                    <div className="mb-10">
                      <h3 className={cn('mb-4', 'text-xl')}>
                        {t('home.searchResults.tracks')}
                      </h3>
                      <div
                        className={cn('flex', 'flex-col', 'gap-2.5', 'mb-5')}
                      >
                        {searchData.tracks.items.map(
                          (track: ITrack, index: number) => {
                            const trackNumber = tracksOffset + index + 1
                            return (
                              <MusicItem
                                key={track.id}
                                track={track}
                                trackNumber={trackNumber}
                              />
                            )
                          }
                        )}
                      </div>
                      {searchData.tracks.total > SEARCH_ITEMS_PER_PAGE && (
                        <Pagination
                          currentPage={tracksPage}
                          totalPages={Math.ceil(
                            searchData.tracks.total / SEARCH_ITEMS_PER_PAGE
                          )}
                          onPageChange={page => {
                            setTracksPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          limit={SEARCH_ITEMS_PER_PAGE}
                          total={searchData.tracks.total}
                        />
                      )}
                    </div>
                  )}

                {selectedTypes.includes('album') &&
                  searchData.albums &&
                  searchData.albums.items &&
                  searchData.albums.items.length > 0 && (
                    <div className="mb-10">
                      <h3 className={cn('mb-4', 'text-xl')}>
                        {t('home.searchResults.albums')}
                      </h3>
                      <div
                        className={cn(
                          'grid',
                          'grid-cols-2',
                          'sm:grid-cols-3',
                          'md:grid-cols-4',
                          'lg:grid-cols-5',
                          'gap-5',
                          'mb-5'
                        )}
                      >
                        {searchData.albums.items.map((album: IAlbum) => (
                          <CardAlbum key={album.id} album={album} />
                        ))}
                      </div>
                      {searchData.albums.total > SEARCH_ITEMS_PER_PAGE && (
                        <Pagination
                          currentPage={albumsPage}
                          totalPages={Math.ceil(
                            searchData.albums.total / SEARCH_ITEMS_PER_PAGE
                          )}
                          onPageChange={page => {
                            setAlbumsPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          limit={SEARCH_ITEMS_PER_PAGE}
                          total={searchData.albums.total}
                        />
                      )}
                    </div>
                  )}

                {!isSearchLoading &&
                  (!selectedTypes.includes('artist') ||
                    !searchData.artists ||
                    !searchData.artists.items ||
                    searchData.artists.items.length === 0) &&
                  (!selectedTypes.includes('track') ||
                    !searchData.tracks ||
                    !searchData.tracks.items ||
                    searchData.tracks.items.length === 0) &&
                  (!selectedTypes.includes('album') ||
                    !searchData.albums ||
                    !searchData.albums.items ||
                    searchData.albums.items.length === 0) && (
                    <div className={cn('text-center', 'py-10')}>
                      <p>{t('home.searchResults.noResults')}</p>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export default Home

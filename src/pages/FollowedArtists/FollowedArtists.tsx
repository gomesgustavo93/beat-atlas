import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpotifyFollowedArtists } from '../../hooks/useSpotifyFollowedArtists'
import type { IArtist } from '../../types/spotify'
import CardArtist from '../../components/CardArtist/CardArtist'
import Pagination from '../../components/Pagination/Pagination'
import { Container } from '../../components'
import { cn } from '../../utils/cn'
import { Users } from 'lucide-react'

const ITEMS_PER_PAGE = 20

function FollowedArtists() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [cursors, setCursors] = useState<{ [key: number]: string | undefined }>(
    { 1: undefined }
  )

  const after = cursors[currentPage]

  const { data, isLoading, error } = useSpotifyFollowedArtists(
    ITEMS_PER_PAGE,
    after
  )

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (data && data.cursors) {
      const nextCursor = data.cursors.after
      if (nextCursor && cursors[currentPage + 1] === undefined) {
        setCursors(prev => ({ ...prev, [currentPage + 1]: nextCursor }))
      }
    }
  }, [data, currentPage, cursors])

  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1

  return (
    <Container>
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-10 h-10 text-purple-500" />
        <h1
          className={cn(
            'text-4xl',
            'font-bold',
            'text-gray-900',
            'dark:text-gray-100'
          )}
        >
          {t('followedArtists.title')}
        </h1>
      </div>

      {isLoading && (
        <div className={cn('text-center', 'py-10')}>
          <p>{t('followedArtists.loading')}</p>
        </div>
      )}

      {error && (
        <div
          className={cn(
            'text-red-600',
            'my-5',
            'p-4',
            'bg-red-50',
            'dark:bg-red-900/20',
            'rounded-lg'
          )}
        >
          <strong>{t('followedArtists.error')}:</strong> {error.message}
          <br />
          <small className="text-sm">{t('followedArtists.errorDetails')}</small>
        </div>
      )}

      {!isLoading && !error && !data && (
        <div className={cn('text-center', 'py-10')}>
          <p>{t('followedArtists.noArtists')}</p>
        </div>
      )}

      {data && data.items && data.items.length > 0 && (
        <div>
          <p
            className={cn(
              'text-lg',
              'text-gray-600',
              'dark:text-gray-400',
              'mb-5'
            )}
          >
            {data.total} {t('followedArtists.total')}
          </p>

          {data.items.length === 0 && (
            <div className={cn('text-center', 'py-10')}>
              <p>{t('followedArtists.noArtistsYet')}</p>
            </div>
          )}

          {data.items.length > 0 && (
            <>
              <div
                className={cn(
                  'grid',
                  'grid-cols-2',
                  'sm:grid-cols-3',
                  'md:grid-cols-4',
                  'lg:grid-cols-5',
                  'gap-5'
                )}
              >
                {data.items.map((artist: IArtist) => (
                  <CardArtist key={artist.id} artist={artist} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={page => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  limit={ITEMS_PER_PAGE}
                  total={data.total}
                />
              )}
            </>
          )}
        </div>
      )}
    </Container>
  )
}

export default FollowedArtists

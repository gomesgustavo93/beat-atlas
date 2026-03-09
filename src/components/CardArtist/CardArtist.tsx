import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '../Card'
import { Button } from '../Button'
import { cn } from '../../utils/cn'
import type { ICardArtistProps } from './CardArtist.types'

function CardArtist({
  artist,
  rank = null,
  onClick,
  showButton = true,
  buttonText,
}: ICardArtistProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const displayButtonText = buttonText || t('common.seeDetails')

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/details-artist/${artist.id}`)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/details-artist/${artist.id}`)
  }

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'overflow-hidden',
        'hover:shadow-lg',
        'transition-all',
        'duration-200',
        'hover:scale-[1.02]',
        'dark:bg-gray-800',
        'dark:border-gray-700',
        'cursor-pointer',
        'p-0',
        'relative'
      )}
    >
      {rank !== null && rank !== undefined && (
        <div
          className={cn(
            'absolute',
            'top-2',
            'right-2',
            'bg-green-500',
            'text-white',
            'rounded-full',
            'w-8',
            'h-8',
            'flex',
            'items-center',
            'justify-center',
            'font-bold',
            'text-sm',
            'z-10'
          )}
        >
          {rank}
        </div>
      )}

      <div className="aspect-square overflow-hidden">
        {artist.images && artist.images.length > 0 ? (
          <img
            src={artist.images[0].url}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-full',
              'h-full',
              'bg-gradient-to-br',
              'from-purple-500',
              'to-pink-500',
              'dark:from-purple-600',
              'dark:to-pink-600'
            )}
          />
        )}
      </div>

      <div className="p-4">
        <h3
          className={cn(
            'font-semibold',
            'text-gray-900',
            'dark:text-gray-100',
            'truncate',
            'mb-1'
          )}
        >
          {artist.name}
        </h3>

        {showButton && (
          <Button
            onClick={handleButtonClick}
            className={cn(
              'w-full',
              'bg-green-500',
              'hover:bg-green-600',
              'text-white'
            )}
            size="sm"
          >
            {displayButtonText}
          </Button>
        )}
      </div>
    </Card>
  )
}

export default CardArtist

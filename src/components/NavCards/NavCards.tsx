import { Heart, Library, Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import Card from '../Card'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function NavCards() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div
      className={cn('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4', 'mb-8')}
    >
      <Card
        className={cn(
          'p-6',
          'cursor-pointer',
          'hover:shadow-lg',
          'transition-all',
          'duration-200',
          'hover:scale-[1.02]',
          'bg-gradient-to-br',
          'from-purple-500',
          'to-purple-600',
          'text-white',
          'dark:from-purple-600',
          'dark:to-purple-700',
          'border-none'
        )}
        onClick={() => navigate('/followed-artists')}
      >
        <Users className="w-8 h-8 mb-3" />
        <h3 className="text-xl font-semibold mb-1">
          {t('home.followedArtistsCard.title')}
        </h3>
        <p className="text-purple-100">
          {t('home.followedArtistsCard.description')}
        </p>
      </Card>

      <Card
        className={cn(
          'p-6',
          'cursor-pointer',
          'hover:shadow-lg',
          'transition-all',
          'duration-200',
          'hover:scale-[1.02]',
          'bg-gradient-to-br',
          'from-pink-500',
          'to-pink-600',
          'text-white',
          'dark:from-pink-600',
          'dark:to-pink-700',
          'border-none'
        )}
        onClick={() => navigate('/favorites')}
      >
        <Heart className="w-8 h-8 mb-3" />
        <h3 className="text-xl font-semibold mb-1">
          {t('home.favoritesCard.title')}
        </h3>
        <p className="text-pink-100">{t('home.favoritesCard.description')}</p>
      </Card>

      <Card
        className={cn(
          'p-6',
          'cursor-pointer',
          'hover:shadow-lg',
          'transition-all',
          'duration-200',
          'hover:scale-[1.02]',
          'bg-gradient-to-br',
          'from-blue-500',
          'to-blue-600',
          'text-white',
          'dark:from-blue-600',
          'dark:to-blue-700',
          'border-none'
        )}
        onClick={() => navigate('/my-musics')}
      >
        <Library className="w-8 h-8 mb-3" />
        <h3 className="text-xl font-semibold mb-1">
          {t('home.myMusicsCard.title')}
        </h3>
        <p className="text-blue-100">{t('home.myMusicsCard.description')}</p>
      </Card>
    </div>
  )
}

export default NavCards

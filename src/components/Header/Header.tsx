import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Music2, Heart, Library, Users, Moon, Sun } from 'lucide-react'
import UserProfile from '../UserProfile/UserProfile'
import LanguageSelector from '../LanguageSelector/LanguageSelector'
import LinkHeader from './components/LinkHeader/LinkHeader'
import { Button } from '../Button'
import { cn } from '../../utils/cn'

function Header() {
  const location = useLocation()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav
      className={cn(
        'bg-gray-900',
        'dark:bg-gray-950',
        'text-white',
        'border-b',
        'border-gray-800',
        'dark:border-gray-700'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/home"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Music2 className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">{t('header.title')}</span>
          </Link>

          <div className="flex items-center space-x-1">
            <div className="flex gap-1 mr-2">
              <LinkHeader
                to="/followed-artists"
                isActive={isActive('/followed-artists')}
                icon={<Users className="w-4 h-4" />}
              >
                {t('header.followedArtists')}
              </LinkHeader>
              <LinkHeader
                to="/favorites"
                isActive={isActive('/favorites')}
                icon={<Heart className="w-4 h-4" />}
              >
                {t('header.favorites')}
              </LinkHeader>
              <LinkHeader
                to="/my-musics"
                isActive={isActive('/my-musics')}
                icon={<Library className="w-4 h-4" />}
              >
                {t('header.myMusics')}
              </LinkHeader>
            </div>

            <LanguageSelector />

            <Button
              variant="ghost"
              className={cn(
                'text-gray-300',
                'hover:text-white',
                'hover:bg-gray-800',
                'dark:hover:bg-gray-900',
                'dark:text-gray-300',
                'mx-2'
              )}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header

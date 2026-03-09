import { useTranslation } from 'react-i18next'
import { login as loginService } from '../../services/oauthService'
import { Button } from '../Button'
import { Logo } from '../Logo'
import { cn } from '../../utils/cn'

function LoginButton() {
  const { t } = useTranslation()

  const handleLogin = () => {
    loginService()
  }

  return (
    <Button
      onClick={handleLogin}
      variant="primary"
      icon={<Logo size="md" />}
      bold
      fullWidth
      size="lg"
      className={cn(
        'w-full',
        'bg-green-500',
        'hover:bg-green-600',
        'text-white',
        'py-4',
        'rounded-xl',
        'text-lg',
        'font-semibold',
        'shadow-lg',
        'transition-all duration-200',
        'hover:shadow-xl',
        'hover:scale-[1.02]'
      )}
    >
      {t('login.button')}
    </Button>
  )
}

export default LoginButton

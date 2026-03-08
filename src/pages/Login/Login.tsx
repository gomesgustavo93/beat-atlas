import { useTranslation } from 'react-i18next';
import { Music2 } from 'lucide-react';
import LoginButton from '../../components/LoginButton/LoginButton';
import { cn } from '../../utils/cn';

function Login() {
    const { t } = useTranslation();

    return (
        <div className={cn(
            'min-h-screen',
            'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
            'flex items-center justify-center',
            'p-4'
        )}>
            <div className="max-w-md w-full">
                <div className={cn('text-center', 'mb-8')}>
                    <div className={cn(
                        'inline-flex items-center justify-center',
                        'w-20 h-20',
                        'bg-white',
                        'rounded-full',
                        'mb-6',
                        'shadow-2xl'
                    )}>
                        <Music2 className={cn('w-10 h-10', 'text-green-500')} />
                    </div>
                    <h1 className={cn(
                        'text-5xl',
                        'font-bold',
                        'text-white',
                        'mb-3'
                    )}>
                        {t('header.title')}
                    </h1>
                    <p className={cn(
                        'text-green-100',
                        'text-lg'
                    )}>
                        {t('login.subtitle')}
                    </p>
                </div>

                <div className={cn(
                    'bg-white',
                    'rounded-2xl',
                    'shadow-2xl',
                    'p-8'
                )}>
                    <h2 className={cn(
                        'text-2xl',
                        'font-semibold',
                        'text-gray-800',
                        'mb-2',
                        'text-center'
                    )}>
                        {t('login.welcomeBack')}
                    </h2>
                    <p className={cn(
                        'text-gray-600',
                        'text-center',
                        'mb-8'
                    )}>
                        {t('login.description')}
                    </p>

                    <LoginButton />

                    <p className={cn(
                        'text-gray-500',
                        'text-sm',
                        'text-center',
                        'mt-6'
                    )}>
                        {t('login.disclaimer')}
                    </p>
                </div>

                <p className={cn(
                    'text-green-100',
                    'text-center',
                    'mt-6',
                    'text-sm'
                )}>
                    {t('login.copyright')}
                </p>
            </div>
        </div>
    );
}

export default Login;

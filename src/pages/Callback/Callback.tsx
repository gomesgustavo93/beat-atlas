import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback as handleCallbackService } from '../../services/oauthService';
import { useUser } from '../../contexts/UserContext/UserContext';
import { Container } from '../../components';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';
import { Loader2, AlertCircle } from 'lucide-react';

function Callback() {
    const navigate = useNavigate();
    const { fetchUserProfile } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) {
            return;
        }

        const handleCallback = async () => {
            hasProcessed.current = true;

            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const errorParam = urlParams.get('error');

                if (errorParam) {
                    setError(`Erro na autorização: ${errorParam}`);
                    setLoading(false);
                    return;
                }

                if (!code) {
                    setError('Código de autorização não encontrado');
                    setLoading(false);
                    return;
                }

                await handleCallbackService(code, state);

                await fetchUserProfile();

                window.history.replaceState({}, '', '/home');

                navigate('/home', { replace: true });
            } catch (err) {
                hasProcessed.current = false;
                setError(err instanceof Error ? err.message : 'Erro ao processar autenticação');
                setLoading(false);
            }
        };

        handleCallback();
    }, [navigate]);

    if (loading) {
        return (
            <Container>
                <div className={cn(
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'min-h-[60vh]',
                    'text-center'
                )}>
                    <Loader2 className={cn(
                        'w-12',
                        'h-12',
                        'text-green-500',
                        'animate-spin',
                        'mb-4'
                    )} />
                    <p className={cn(
                        'text-lg',
                        'text-gray-600',
                        'dark:text-gray-400'
                    )}>
                        Processando autenticação...
                    </p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className={cn(
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'min-h-[60vh]',
                    'text-center',
                    'max-w-2xl',
                    'mx-auto'
                )}>
                    <AlertCircle className={cn(
                        'w-16',
                        'h-16',
                        'text-red-500',
                        'mb-4'
                    )} />
                    <h2 className={cn(
                        'text-2xl',
                        'font-bold',
                        'text-gray-900',
                        'dark:text-gray-100',
                        'mb-4'
                    )}>
                        Erro na Autenticação
                    </h2>
                    <p className={cn(
                        'text-red-600',
                        'dark:text-red-400',
                        'mb-6',
                        'text-lg'
                    )}>
                        {error}
                    </p>
                    <Button
                        onClick={() => navigate('/login')}
                        variant="primary"
                    >
                        Voltar para Login
                    </Button>
                </div>
            </Container>
        );
    }

    return null;
}

export default Callback;

import type { IAlbum } from '../../types/spotify';
import { cn } from '../../utils/cn';

interface CardAlbumProps {
    album: IAlbum;
    onClick?: () => void;
}

export default function CardAlbum({ album, onClick }: CardAlbumProps) {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (album.external_urls?.spotify) {
            window.open(album.external_urls.spotify, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            className={cn(
                'flex',
                'flex-col',
                'p-3',
                'bg-gray-100',
                'dark:bg-gray-800',
                'rounded-lg',
                'border',
                'border-gray-200',
                'dark:border-gray-700',
                'cursor-pointer',
                'transition-all',
                'duration-200',
                'hover:-translate-y-1',
                'hover:shadow-md'
            )}
            onClick={handleClick}
        >
            {/* Imagem do álbum */}
            {album.images && album.images.length > 0 ? (
                <img
                    src={album.images[0].url}
                    alt={album.name}
                    className={cn(
                        'w-full',
                        'aspect-square',
                        'rounded-md',
                        'object-cover',
                        'mb-2.5'
                    )}
                />
            ) : (
                <div className={cn(
                    'w-full',
                    'aspect-square',
                    'rounded-md',
                    'bg-gray-200',
                    'dark:bg-gray-700',
                    'mb-2.5'
                )} />
            )}

            {/* Informações do álbum */}
            <div className="flex-1">
                <p className={cn(
                    'm-0',
                    'font-bold',
                    'text-base',
                    'mb-1',
                    'text-gray-900',
                    'dark:text-gray-100',
                    'line-clamp-2'
                )}>
                    {album.name}
                </p>
                {album.release_date && (
                    <p className={cn(
                        'mt-1',
                        'text-sm',
                        'text-gray-600',
                        'dark:text-gray-400'
                    )}>
                        {new Date(album.release_date).getFullYear()}
                    </p>
                )}
                {album.total_tracks && (
                    <p className={cn(
                        'mt-1',
                        'text-xs',
                        'text-gray-500',
                        'dark:text-gray-500'
                    )}>
                        {album.total_tracks} {album.total_tracks === 1 ? 'faixa' : 'faixas'}
                    </p>
                )}
            </div>
        </div>
    );
}

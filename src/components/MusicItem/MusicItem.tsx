import { useState, useEffect } from 'react';
import { Music2, Heart } from 'lucide-react';
import type { ITrack } from '../../types/spotify';
import { cn } from '../../utils/cn';
import { formatDuration } from '../../utils/formatDuration';
import { useUser } from '../../contexts/UserContext/UserContext';

interface MusicItemProps {
    track: ITrack;
    trackNumber: number;
}

const getStorageKey = (userId: string | null): string | null => {
    if (!userId) return null;
    return `beat_atlas_favorite_musics_${userId}`;
};

interface FavoriteMusic {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
        external_urls: { spotify: string };
        followers: { href: string | null; total: number };
        genres: string[];
        images: Array<{ url: string; height: number; width: number }>;
        popularity: number;
        type: string;
        uri: string;
    }>;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
}

function MusicItem({ track, trackNumber }: MusicItemProps) {
    const { state: userState } = useUser();
    const userId = userState.profile?.id || null;

    const [isFavorite, setIsFavorite] = useState(false);

    const hasSpotifyUrl = track.external_urls?.spotify && track.external_urls.spotify.trim() !== '';
    const hasDuration = !!(track.duration_ms && Number(track.duration_ms) > 0);

    useEffect(() => {
        if (!userId) {
            setIsFavorite(false);
            return;
        }

        const storageKey = getStorageKey(userId);
        if (!storageKey) return;

        const savedMusics = localStorage.getItem(storageKey);
        if (savedMusics) {
            try {
                const parsed: FavoriteMusic[] = JSON.parse(savedMusics);
                if (Array.isArray(parsed)) {
                    const isSaved = parsed.some((music) => {
                        if (music.id === track.id) return true;
                        if (music.name === track.name) {
                            const musicArtists = music.artists.map(a => a.name).sort().join(',');
                            const trackArtists = track.artists.map(a => a.name).sort().join(',');
                            return musicArtists === trackArtists;
                        }
                        return false;
                    });
                    setIsFavorite(isSaved);
                }
            } catch (error) {
                console.error('Erro ao verificar música favorita:', error);
            }
        }
    }, [track, userId]);

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!userId) return;

        const storageKey = getStorageKey(userId);
        if (!storageKey) return;

        const savedMusics = localStorage.getItem(storageKey);
        let favoriteMusics: FavoriteMusic[] = savedMusics ? JSON.parse(savedMusics) : [];

        if (isFavorite) {
            favoriteMusics = favoriteMusics.filter((music) => {
                if (music.id === track.id) return false;
                if (music.name === track.name) {
                    const musicArtists = music.artists.map(a => a.name).sort().join(',');
                    const trackArtists = track.artists.map(a => a.name).sort().join(',');
                    return musicArtists !== trackArtists;
                }
                return true;
            });
        } else {
            // Adiciona a música
            const newFavorite: FavoriteMusic = {
                id: track.id,
                name: track.name,
                artists: track.artists.map((artist) => ({
                    id: artist.id,
                    name: artist.name,
                    external_urls: artist.external_urls || { spotify: '' },
                    followers: { href: null, total: 0 },
                    genres: [],
                    images: artist.images || [],
                    popularity: 0,
                    type: artist.type || 'artist',
                    uri: artist.uri || '',
                })),
                album: {
                    name: track.album.name || '',
                    images: track.album.images || [],
                },
                external_urls: {
                    spotify: track.external_urls?.spotify || '',
                },
                duration_ms: track.duration_ms || 0,
            };
            favoriteMusics.push(newFavorite);
        }

        localStorage.setItem(storageKey, JSON.stringify(favoriteMusics));
        setIsFavorite(!isFavorite);

        window.dispatchEvent(new CustomEvent('favoriteMusicsUpdated'));
    };

    return (
        <div
            className={cn(
                'flex',
                'items-center',
                'gap-4',
                'p-3',
                'bg-gray-100',
                'dark:bg-gray-800',
                'rounded-lg',
                'border',
                'border-gray-200',
                'dark:border-gray-700',
                'transition-all',
                'duration-200',
                'hover:shadow-md'
            )}
        >
            <span className={cn(
                'font-bold',
                'text-gray-600',
                'dark:text-gray-400',
                'min-w-[30px]',
                'text-sm'
            )}>
                {trackNumber}
            </span>

            {track.album.images && track.album.images.length > 0 ? (
                <img
                    src={track.album.images[2]?.url || track.album.images[0].url}
                    alt={track.album.name}
                    className={cn(
                        'w-12',
                        'h-12',
                        'rounded-md',
                        'object-cover',
                        'flex-shrink-0'
                    )}
                />
            ) : (
                <div className={cn(
                    'w-12',
                    'h-12',
                    'rounded-md',
                    'bg-gray-300',
                    'dark:bg-gray-600',
                    'flex',
                    'items-center',
                    'justify-center',
                    'flex-shrink-0'
                )}>
                    <Music2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className={cn(
                    'm-0',
                    'font-bold',
                    'text-base',
                    'text-gray-900',
                    'dark:text-white',
                    'truncate'
                )}>
                    {track.name}
                </p>
                <p className={cn(
                    'mt-1',
                    'text-sm',
                    'text-gray-600',
                    'dark:text-gray-400',
                    'truncate'
                )}>
                    {track.artists.map(a => a.name).join(', ')}
                </p>
            </div>

            {userId && (
                <button
                    onClick={handleToggleFavorite}
                    className={cn(
                        'inline-flex',
                        'items-center',
                        'justify-center',
                        'p-2',
                        'rounded-md',
                        'transition-colors',
                        'duration-200',
                        'hover:bg-pink-50',
                        'dark:hover:bg-pink-900/20',
                        'focus:outline-none',
                        'focus:ring-2',
                        'focus:ring-pink-500',
                        'focus:ring-offset-2',
                        'flex-shrink-0'
                    )}
                    title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                    <Heart
                        className={cn(
                            'w-5',
                            'h-5',
                            isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400 dark:text-gray-500'
                        )}
                    />
                </button>
            )}

            {hasSpotifyUrl ? (
                <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'inline-flex',
                        'items-center',
                        'justify-center',
                        'p-2',
                        'bg-green-500',
                        'text-white',
                        'rounded-md',
                        'transition-colors',
                        'duration-200',
                        'hover:bg-green-600',
                        'focus:outline-none',
                        'focus:ring-2',
                        'focus:ring-green-500',
                        'focus:ring-offset-2',
                        'flex-shrink-0'
                    )}
                >
                    <Music2 className="w-4 h-4" />
                </a>
            ) : (
                <button
                    disabled
                    className={cn(
                        'inline-flex',
                        'items-center',
                        'justify-center',
                        'p-2',
                        'bg-gray-300',
                        'dark:bg-gray-600',
                        'text-gray-500',
                        'dark:text-gray-400',
                        'rounded-md',
                        'cursor-not-allowed',
                        'opacity-50',
                        'flex-shrink-0'
                    )}
                    title="Link do Spotify não disponível"
                >
                    <Music2 className="w-4 h-4" />
                </button>
            )}

            {hasDuration && (
                <div className={cn(
                    'text-sm',
                    'text-gray-600',
                    'dark:text-gray-400',
                    'min-w-[60px]',
                    'text-right',
                    'flex-shrink-0'
                )}>
                    {formatDuration(track.duration_ms)}
                </div>
            )}
        </div>
    );
}

export default MusicItem;
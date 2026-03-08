import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import MusicItem from '../../components/MusicItem/MusicItem';
import { useUser } from '../../contexts/UserContext/UserContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';
import type { ITrack } from '../../types/spotify';
import { Library, Plus } from 'lucide-react';
import { Container } from '../../components';
import { useSpotifySearch } from '../../hooks';

const createFavoriteMusicSchema = (t: (key: string) => string) => z.object({
    name: z
        .string()
        .min(1, t('myMusics.form.errors.musicNameRequired'))
        .min(2, t('myMusics.form.errors.musicNameMinLength')),
    artists: z
        .string()
        .min(1, t('myMusics.form.errors.artistsRequired'))
        .refine(
            (val) => val.split(',').map(a => a.trim()).filter(Boolean).length > 0,
            { message: t('myMusics.form.errors.artistsRequired') }
        ),
    spotifyUrl: z
        .string()
        .optional()
        .refine(
            (val) => !val || val === '' || z.string().url().safeParse(val).success,
            { message: t('myMusics.form.errors.invalidUrl') }
        ),
    duration: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val === '') return true;
                // Aceita formato MM:SS ou apenas minutos
                const mmssPattern = /^\d{1,2}:\d{2}$/;
                const minutesPattern = /^\d+$/;
                return mmssPattern.test(val) || minutesPattern.test(val);
            },
            { message: t('myMusics.form.errors.invalidDuration') }
        ),
});

type FavoriteMusicForm = z.infer<ReturnType<typeof createFavoriteMusicSchema>>;

interface FavoriteMusic extends Omit<ITrack, 'id' | 'album' | 'preview_url' | 'popularity'> {
    id: string;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
}

const getStorageKey = (userId: string | null): string | null => {
    if (!userId) return null;
    return `beat_atlas_favorite_musics_${userId}`;
};

function MyMusics() {
    const { t } = useTranslation();

    const schema = createFavoriteMusicSchema(t);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<FavoriteMusicForm>({
        resolver: zodResolver(schema),
    });

    const { state: userState } = useUser();
    const userId = userState.profile?.id || null;

    const [favoriteMusics, setFavoriteMusics] = useState<FavoriteMusic[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const musicName = watch('name');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: searchData, isLoading: isSearching } = useSpotifySearch(
        debouncedSearchQuery,
        ['track'],
        5,
        0,
        debouncedSearchQuery.trim().length > 0 && showSuggestions
    );

    useEffect(() => {
        if (musicName !== undefined) {
            setSearchQuery(musicName);
        }
    }, [musicName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectTrack = (track: ITrack) => {
        setValue('name', track.name);
        setValue('artists', track.artists.map(a => a.name).join(', '));
        setValue('spotifyUrl', track.external_urls?.spotify || '');
        if (track.duration_ms) {
            const minutes = Math.floor(track.duration_ms / 60000);
            const seconds = Math.floor((track.duration_ms % 60000) / 1000);
            setValue('duration', `${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
        setSelectedTrack(track);
        setShowSuggestions(false);
        setSearchQuery(track.name);
    };

    const loadFavoriteMusics = useCallback(() => {
        if (!userId) {
            setIsLoaded(false);
            return;
        }

        const storageKey = getStorageKey(userId);
        if (!storageKey) return;

        const savedMusics = localStorage.getItem(storageKey);
        if (savedMusics) {
            try {
                const parsed = JSON.parse(savedMusics);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setFavoriteMusics(parsed);
                } else {
                    setFavoriteMusics([]);
                }
            } catch (error) {
                console.error('Erro ao carregar músicas do localStorage:', error);
                setFavoriteMusics([]);
            }
        } else {
            setFavoriteMusics([]);
        }
        setIsLoaded(true);
    }, [userId]);

    useEffect(() => {
        loadFavoriteMusics();
    }, [loadFavoriteMusics]);

    useEffect(() => {
        const handleFavoriteMusicsUpdate = () => {
            loadFavoriteMusics();
        };

        window.addEventListener('favoriteMusicsUpdated', handleFavoriteMusicsUpdate);
        return () => {
            window.removeEventListener('favoriteMusicsUpdated', handleFavoriteMusicsUpdate);
        };
    }, [loadFavoriteMusics]);

    useEffect(() => {
        if (!isLoaded || !userId) return;

        const storageKey = getStorageKey(userId);
        if (!storageKey) return;

        localStorage.setItem(storageKey, JSON.stringify(favoriteMusics));
    }, [favoriteMusics, isLoaded, userId]);

    const parseDuration = (duration: string | undefined): number => {
        if (!duration) return 0;

        if (duration.includes(':')) {
            const [minutes, seconds] = duration.split(':').map(Number);
            return (minutes * 60 + seconds) * 1000;
        }

        const minutes = parseInt(duration, 10);
        return minutes * 60 * 1000;
    };

    const onSubmit = (data: FavoriteMusicForm) => {
        const artists = data.artists.split(',').map(artist => artist.trim()).filter(Boolean);

        const newMusic: FavoriteMusic = selectedTrack ? {
            id: selectedTrack.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            artists: selectedTrack.artists.map((artist, index) => ({
                id: artist.id || `local_artist_${index}`,
                name: artist.name,
                external_urls: artist.external_urls || { spotify: '' },
                followers: { href: null, total: 0 },
                genres: [],
                images: artist.images || [],
                popularity: 0,
                type: 'artist',
                uri: artist.uri || '',
            })),
            album: {
                name: selectedTrack.album.name || '',
                images: selectedTrack.album.images || [],
            },
            external_urls: {
                spotify: data.spotifyUrl || selectedTrack.external_urls?.spotify || '',
            },
            duration_ms: parseDuration(data.duration) || selectedTrack.duration_ms || 0,
        } : {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            artists: artists.map((name, index) => ({
                id: `local_artist_${index}`,
                name,
                external_urls: { spotify: '' },
                followers: { href: null, total: 0 },
                genres: [],
                images: [],
                popularity: 0,
                type: 'artist',
                uri: '',
            })),
            album: {
                name: '',
                images: [],
            },
            external_urls: {
                spotify: data.spotifyUrl || '',
            },
            duration_ms: parseDuration(data.duration),
        };

        setFavoriteMusics(prev => [...prev, newMusic]);
        setSelectedTrack(null);
        reset();
    };

    const convertToTrack = (music: FavoriteMusic, index: number): ITrack => {
        return {
            ...music,
            album: {
                id: `local_album_${index}`,
                name: music.album.name || '',
                images: music.album.images,
            },
            preview_url: null,
            popularity: 0,
        };
    };

    if (userState.loading || !userId) {
        return (
            <div className="p-5 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t('myMusics.title')}</h1>
                <p className="text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <Container>
            <div className="flex items-center gap-3 mb-8">
                <Library className="w-10 h-10 text-blue-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t('myMusics.title')}</h1>
            </div>

            <Card className={cn(
                'p-6',
                'mb-8',
                'dark:bg-gray-800',
                'dark:border-gray-700'
            )}>
                <h2 className={cn(
                    'text-2xl',
                    'font-semibold',
                    'text-gray-900',
                    'dark:text-gray-100',
                    'mb-4',
                    'flex',
                    'items-center',
                    'gap-2'
                )}>
                    <Plus className="w-6 h-6 text-green-500" />
                    {t('myMusics.addMusic')}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label
                                htmlFor="name"
                                className={cn(
                                    'block',
                                    'text-sm',
                                    'font-medium',
                                    'text-gray-700',
                                    'dark:text-gray-300',
                                    'mb-1'
                                )}
                            >
                                {t('myMusics.form.musicName')}
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name')}
                                placeholder="Ex: Blinding Lights"
                                onChange={(e) => {
                                    register('name').onChange(e);
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                ref={(e) => {
                                    const { ref } = register('name');
                                    ref(e);
                                    searchInputRef.current = e;
                                }}
                                className={cn(
                                    'w-full',
                                    'px-3',
                                    'py-2',
                                    'border',
                                    'border-gray-300',
                                    'rounded-lg',
                                    'focus:outline-none',
                                    'focus:ring-2',
                                    'focus:ring-green-500',
                                    'focus:border-transparent',
                                    'dark:bg-gray-700',
                                    'dark:border-gray-600',
                                    'dark:text-gray-100',
                                    errors.name && 'border-red-500'
                                )}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}

                            {showSuggestions && debouncedSearchQuery.trim().length > 0 && (
                                <div
                                    ref={suggestionsRef}
                                    className={cn(
                                        'absolute',
                                        'z-50',
                                        'w-full',
                                        'mt-1',
                                        'bg-white',
                                        'dark:bg-gray-800',
                                        'border',
                                        'border-gray-200',
                                        'dark:border-gray-700',
                                        'rounded-lg',
                                        'shadow-lg',
                                        'max-h-64',
                                        'overflow-y-auto'
                                    )}
                                >
                                    {isSearching && (
                                        <div className={cn(
                                            'p-3',
                                            'text-center',
                                            'text-gray-600',
                                            'dark:text-gray-400',
                                            'text-sm'
                                        )}>
                                            Buscando...
                                        </div>
                                    )}

                                    {!isSearching && searchData?.tracks?.items && searchData.tracks.items.length > 0 && (
                                        <div className="py-1">
                                            {searchData.tracks.items.map((track: ITrack) => (
                                                <button
                                                    key={track.id}
                                                    type="button"
                                                    onClick={() => handleSelectTrack(track)}
                                                    className={cn(
                                                        'w-full',
                                                        'text-left',
                                                        'px-4',
                                                        'py-2',
                                                        'hover:bg-gray-100',
                                                        'dark:hover:bg-gray-700',
                                                        'transition-colors',
                                                        'duration-150',
                                                        'flex',
                                                        'items-center',
                                                        'gap-3'
                                                    )}
                                                >
                                                    {track.album.images && track.album.images.length > 0 && (
                                                        <img
                                                            src={track.album.images[2]?.url || track.album.images[0].url}
                                                            alt={track.album.name}
                                                            className={cn(
                                                                'w-10',
                                                                'h-10',
                                                                'rounded',
                                                                'object-cover',
                                                                'flex-shrink-0'
                                                            )}
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            'font-semibold',
                                                            'text-sm',
                                                            'text-gray-900',
                                                            'dark:text-gray-100',
                                                            'truncate'
                                                        )}>
                                                            {track.name}
                                                        </p>
                                                        <p className={cn(
                                                            'text-xs',
                                                            'text-gray-600',
                                                            'dark:text-gray-400',
                                                            'truncate'
                                                        )}>
                                                            {track.artists.map(a => a.name).join(', ')}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {!isSearching && searchData?.tracks?.items && searchData.tracks.items.length === 0 && (
                                        <div className={cn(
                                            'p-3',
                                            'text-center',
                                            'text-gray-600',
                                            'dark:text-gray-400',
                                            'text-sm'
                                        )}>
                                            Nenhuma música encontrada
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="artists"
                                className={cn(
                                    'block',
                                    'text-sm',
                                    'font-medium',
                                    'text-gray-700',
                                    'dark:text-gray-300',
                                    'mb-1'
                                )}
                            >
                                {t('myMusics.form.artists')}
                            </label>
                            <input
                                id="artists"
                                type="text"
                                {...register('artists')}
                                placeholder="Ex: The Weeknd"
                                className={cn(
                                    'w-full',
                                    'px-3',
                                    'py-2',
                                    'border',
                                    'border-gray-300',
                                    'rounded-lg',
                                    'focus:outline-none',
                                    'focus:ring-2',
                                    'focus:ring-green-500',
                                    'focus:border-transparent',
                                    'dark:bg-gray-700',
                                    'dark:border-gray-600',
                                    'dark:text-gray-100',
                                    errors.artists && 'border-red-500'
                                )}
                            />
                            {errors.artists ? (
                                <p className="mt-1 text-sm text-red-600">{errors.artists.message}</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">{t('myMusics.form.artistsHint')}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="spotifyUrl"
                                className={cn(
                                    'block',
                                    'text-sm',
                                    'font-medium',
                                    'text-gray-700',
                                    'dark:text-gray-300',
                                    'mb-1'
                                )}
                            >
                                {t('myMusics.form.spotifyUrl')}
                            </label>
                            <input
                                id="spotifyUrl"
                                type="url"
                                {...register('spotifyUrl')}
                                placeholder="https://open.spotify.com/track/..."
                                className={cn(
                                    'w-full',
                                    'px-3',
                                    'py-2',
                                    'border',
                                    'border-gray-300',
                                    'rounded-lg',
                                    'focus:outline-none',
                                    'focus:ring-2',
                                    'focus:ring-green-500',
                                    'focus:border-transparent',
                                    'dark:bg-gray-700',
                                    'dark:border-gray-600',
                                    'dark:text-gray-100',
                                    errors.spotifyUrl && 'border-red-500'
                                )}
                            />
                            {errors.spotifyUrl ? (
                                <p className="mt-1 text-sm text-red-600">{errors.spotifyUrl.message}</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">{t('myMusics.form.spotifyUrlHint')}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="duration"
                                className={cn(
                                    'block',
                                    'text-sm',
                                    'font-medium',
                                    'text-gray-700',
                                    'dark:text-gray-300',
                                    'mb-1'
                                )}
                            >
                                {t('myMusics.form.duration')}
                            </label>
                            <input
                                id="duration"
                                type="text"
                                {...register('duration')}
                                placeholder="Ex: 3:20"
                                className={cn(
                                    'w-full',
                                    'px-3',
                                    'py-2',
                                    'border',
                                    'border-gray-300',
                                    'rounded-lg',
                                    'focus:outline-none',
                                    'focus:ring-2',
                                    'focus:ring-green-500',
                                    'focus:border-transparent',
                                    'dark:bg-gray-700',
                                    'dark:border-gray-600',
                                    'dark:text-gray-100',
                                    errors.duration && 'border-red-500'
                                )}
                            />
                            {errors.duration ? (
                                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">{t('myMusics.form.durationHint')}</p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={cn(
                            'w-full',
                            'bg-green-500',
                            'hover:bg-green-600',
                            'text-white'
                        )}
                        icon={<Plus className="w-5 h-5" />}
                        bold
                    >
                        {t('myMusics.form.addButton')}
                    </Button>
                </form>
            </Card>

            <div>
                <h2 className={cn(
                    'mb-5',
                    'text-xl',
                    'font-semibold',
                    'text-gray-900',
                    'dark:text-gray-100'
                )}>
                    {t('myMusics.myFavorites')} ({favoriteMusics.length})
                </h2>

                {favoriteMusics.length === 0 ? (
                    <p className={cn(
                        'text-center',
                        'text-gray-600',
                        'py-10'
                    )}>
                        {t('myMusics.noMusics')}
                    </p>
                ) : (
                    <div className={cn(
                        'flex',
                        'flex-col',
                        'gap-2.5'
                    )}>
                        {favoriteMusics.map((music, index) => (
                            <MusicItem
                                key={music.id}
                                track={convertToTrack(music, index)}
                                trackNumber={index + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}

export default MyMusics;
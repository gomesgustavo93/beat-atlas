import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useSpotifyTopArtists, useSpotifyTopTracks } from '../../hooks';
import type { IArtist, ITrack } from '../../types/spotify';
import CardArtist from '../../components/CardArtist/CardArtist';
import Pagination from '../../components/Pagination/Pagination';
import ChartPie from '../../components/ChartPie/ChartPie';
import MusicItem from '../../components/MusicItem/MusicItem';
import { Heart } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Container } from '../../components';

const ITEMS_PER_PAGE = 20;

const Favorites = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [type, setType] = useState<'artists' | 'tracks'>('tracks');
    const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('long_term');
    const [currentPage, setCurrentPage] = useState(1);
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const { data: artistsData, isLoading: isLoadingArtists, error: artistsError } = useSpotifyTopArtists(timeRange, ITEMS_PER_PAGE, offset);
    const { data: tracksData, isLoading: isLoadingTracks, error: tracksError } = useSpotifyTopTracks(timeRange, ITEMS_PER_PAGE, offset);

    const { data: allTracksData } = useSpotifyTopTracks(timeRange, 50, 0);

    useEffect(() => {
        setCurrentPage(1);
    }, [type, timeRange]);

    const isLoading = type === 'artists' ? isLoadingArtists : isLoadingTracks;
    const error = type === 'artists' ? artistsError : tracksError;

    const artists = artistsData?.items || [];
    const tracks = tracksData?.items || [];

    const totalPages = type === 'artists'
        ? (artistsData?.total ? Math.ceil(artistsData.total / ITEMS_PER_PAGE) : 1)
        : (tracksData?.total ? Math.ceil(tracksData.total / ITEMS_PER_PAGE) : 1);

    const total = type === 'artists' ? artistsData?.total || 0 : tracksData?.total || 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Container>
            <div className={cn(
                'flex',
                'justify-between',
                'items-center',
                'mb-8',
                'flex-wrap',
                'gap-5'
            )}>
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t('favorites.title')}</h1>
                </div>

                <div className={cn(
                    'flex',
                    'gap-4',
                    'flex-wrap'
                )}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel
                            id="favorites-type-label"
                            sx={{
                                color: isDark ? 'rgb(209, 213, 219)' : 'rgba(0, 0, 0, 0.6)',
                                '&.Mui-focused': {
                                    color: '#1DB954',
                                },
                            }}
                        >
                            {t('favorites.typeLabel')}
                        </InputLabel>
                        <Select
                            labelId="favorites-type-label"
                            id="favorites-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as 'artists' | 'tracks')}
                            label={t('favorites.typeLabel')}
                            sx={{
                                color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1DB954',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1DB954',
                                },
                                '& .MuiSelect-icon': {
                                    color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'white',
                                        '& .MuiMenuItem-root': {
                                            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                            '&:hover': {
                                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: isDark ? 'rgba(29, 185, 84, 0.2)' : 'rgba(29, 185, 84, 0.1)',
                                                color: '#1DB954',
                                                '&:hover': {
                                                    backgroundColor: isDark ? 'rgba(29, 185, 84, 0.3)' : 'rgba(29, 185, 84, 0.15)',
                                                },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="artists">{t('favorites.types.artists')}</MenuItem>
                            <MenuItem value="tracks">{t('favorites.types.tracks')}</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 300 }}>
                        <InputLabel
                            id="favorites-timeRange-label"
                            sx={{
                                color: isDark ? 'rgb(209, 213, 219)' : 'rgba(0, 0, 0, 0.6)',
                                '&.Mui-focused': {
                                    color: '#1DB954',
                                },
                            }}
                        >
                            {t('favorites.timeRangeLabel')}
                        </InputLabel>
                        <Select
                            labelId="favorites-timeRange-label"
                            id="favorites-timeRange"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as 'short_term' | 'medium_term' | 'long_term')}
                            label={t('favorites.timeRangeLabel')}
                            sx={{
                                color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1DB954',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1DB954',
                                },
                                '& .MuiSelect-icon': {
                                    color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'white',
                                        '& .MuiMenuItem-root': {
                                            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                            '&:hover': {
                                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: isDark ? 'rgba(29, 185, 84, 0.2)' : 'rgba(29, 185, 84, 0.1)',
                                                color: '#1DB954',
                                                '&:hover': {
                                                    backgroundColor: isDark ? 'rgba(29, 185, 84, 0.3)' : 'rgba(29, 185, 84, 0.15)',
                                                },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="short_term">{t('favorites.timeRange.4weeks')}</MenuItem>
                            <MenuItem value="medium_term">{t('favorites.timeRange.6months')}</MenuItem>
                            <MenuItem value="long_term">{t('favorites.timeRange.allTime')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            {isLoading && (
                <div className={cn(
                    'text-center',
                    'py-10'
                )}>
                    <p>{t('favorites.loading')}</p>
                </div>
            )}

            {error && (
                <div className={cn(
                    'text-red-600',
                    'my-5',
                    'p-4',
                    'bg-red-50',
                    'rounded-lg'
                )}>
                    <strong>{t('favorites.error')}:</strong> {error.message}
                </div>
            )}

            {!isLoading && !error && type === 'artists' && artists.length > 0 && (
                <div>
                    <div className={cn(
                        'grid',
                        'grid-cols-2',
                        'sm:grid-cols-3',
                        'md:grid-cols-4',
                        'lg:grid-cols-5',
                        'gap-5'
                    )}>
                        {artists.map((artist: IArtist, index: number) => {
                            const artistNumber = offset + index + 1;

                            return (
                                <CardArtist
                                    key={artist.id}
                                    artist={artist}
                                    rank={artistNumber}
                                />
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            limit={ITEMS_PER_PAGE}
                            total={total}
                        />
                    )}
                </div>
            )}

            {!isLoading && !error && type === 'tracks' && tracks.length > 0 && (
                <div className={cn(
                    'grid',
                    'grid-cols-1',
                    'lg:grid-cols-[1fr_400px]',
                    'gap-8',
                    'items-start'
                )}>
                    <div>
                        <div className={cn(
                            'flex',
                            'flex-col',
                            'gap-2.5'
                        )}>
                            {tracks.map((track: ITrack, index: number) => {
                                const trackNumber = offset + index + 1;

                                return (
                                    <MusicItem
                                        key={track.id}
                                        track={track}
                                        trackNumber={trackNumber}
                                    />
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                limit={ITEMS_PER_PAGE}
                                total={total}
                            />
                        )}
                    </div>

                    <div>
                        <ChartPie tracks={allTracksData?.items || []} />
                    </div>
                </div>
            )}

            {!isLoading && !error && ((type === 'artists' && artists.length === 0) || (type === 'tracks' && tracks.length === 0)) && (
                <div className={cn(
                    'text-center',
                    'py-10'
                )}>
                    <p>{t('favorites.noItems')}</p>
                </div>
            )}
        </Container>
    );
};

export default Favorites;
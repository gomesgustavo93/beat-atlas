import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSpotifyArtist, useSpotifyArtistAlbums } from '../../hooks';
import Pagination from '../../components/Pagination/Pagination';
import CardAlbum from '../../components/CardAlbum/CardAlbum';
import { cn } from '../../utils/cn';

const ALBUMS_PER_PAGE = 10;

function DetailsArtist() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [albumsPage, setAlbumsPage] = useState(1);
    const { data: artist, isLoading, error } = useSpotifyArtist(id || null);

    const albumsOffset = (albumsPage - 1) * ALBUMS_PER_PAGE;
    const { data: albumsData, isLoading: isLoadingAlbums, error: albumsError } = useSpotifyArtistAlbums(
        id || null,
        ALBUMS_PER_PAGE,
        albumsOffset
    );

    const albums = albumsData?.items || [];


    if (isLoading) {
        return (
            <div className="p-5 text-center">
                <p>{t('detailsArtist.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5">
                <div className={cn(
                    'text-red-600',
                    'my-5',
                    'p-4',
                    'bg-red-50',
                    'rounded-lg'
                )}>
                    <strong>{t('detailsArtist.error')}:</strong> {error.message}
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="p-5 text-center">
                <p>{t('detailsArtist.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="p-5">
            <div className="max-w-7xl mx-auto">
                <div className={cn(
                    'bg-gradient-to-r',
                    'from-purple-500',
                    'to-pink-500',
                    'dark:from-purple-600',
                    'dark:to-pink-600',
                    'rounded-2xl',
                    'p-8',
                    'mb-8',
                    'text-white'
                )}>
                    <div className={cn(
                        'flex',
                        'flex-col',
                        'md:flex-row',
                        'gap-8',
                        'items-start',
                        'md:items-center'
                    )}>
                        {artist.images && artist.images.length > 0 ? (
                            <img
                                src={artist.images[0].url}
                                alt={artist.name}
                                className={cn(
                                    'w-48',
                                    'h-48',
                                    'rounded-full',
                                    'object-cover',
                                    'shadow-2xl',
                                    'flex-shrink-0'
                                )}
                            />
                        ) : (
                            <div className={cn(
                                'w-48',
                                'h-48',
                                'rounded-full',
                                'bg-white/20',
                                'flex-shrink-0'
                            )} />
                        )}

                        <div className="flex-1">
                            <h1 className={cn(
                                'text-5xl',
                                'font-bold',
                                'mb-3'
                            )}>
                                {artist.name}
                            </h1>

                            <p className={cn(
                                'text-lg',
                                'text-white/90'
                            )}>
                                {t('detailsArtist.description')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <h2 className={cn(
                        'mb-5',
                        'text-2xl',
                        'font-semibold',
                        'text-gray-900',
                        'dark:text-gray-100'
                    )}>
                        Álbuns
                    </h2>

                    {isLoadingAlbums && (
                        <p className={cn(
                            'text-center',
                            'text-gray-600',
                            'py-10'
                        )}>
                            Carregando álbuns...
                        </p>
                    )}

                    {albumsError && (
                        <div className={cn(
                            'text-red-600',
                            'p-4',
                            'bg-red-50',
                            'rounded-lg',
                            'mb-5'
                        )}>
                            <strong>Erro:</strong> {albumsError.message}
                        </div>
                    )}

                    {albums && albums.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                {albums.map((album) => (
                                    <CardAlbum
                                        key={album.id}
                                        album={album}
                                    />
                                ))}
                            </div>

                            {albumsData && albumsData.total > ALBUMS_PER_PAGE && (
                                <Pagination
                                    currentPage={albumsPage}
                                    totalPages={Math.ceil(albumsData.total / ALBUMS_PER_PAGE)}
                                    onPageChange={(page) => {
                                        setAlbumsPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    limit={ALBUMS_PER_PAGE}
                                    total={albumsData.total}
                                />
                            )}
                        </>
                    )}

                    {!isLoadingAlbums && !albumsError && albums && albums.length === 0 && (
                        <p className={cn(
                            'text-center',
                            'text-gray-600',
                            'py-10'
                        )}>
                            Nenhum álbum encontrado.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetailsArtist;
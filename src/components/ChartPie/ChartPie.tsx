import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { cn } from '../../utils/cn';
import type { ITrack } from '../../types/spotify';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartPieProps {
    tracks: ITrack[];
}

function ChartPie({ tracks }: ChartPieProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const chartData = useMemo(() => {
        if (!tracks || tracks.length === 0) {
            return null;
        }

        const artistCount: Record<string, number> = {};

        tracks.forEach((track) => {
            track.artists.forEach((artist) => {
                if (artistCount[artist.name]) {
                    artistCount[artist.name]++;
                } else {
                    artistCount[artist.name] = 1;
                }
            });
        });

        const sortedArtists = Object.entries(artistCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (sortedArtists.length === 0) {
            return null;
        }

        const labels = sortedArtists.map(([name]) => name);
        const data = sortedArtists.map(([, count]) => count);

        const colors = [
            '#1DB954',
            '#1ed760',
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#FFA07A',
            '#98D8C8',
            '#F7DC6F',
            '#BB8FCE',
            '#85C1E2',
        ];

        return {
            labels,
            datasets: [
                {
                    label: 'Aparições',
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 2,
                },
            ],
        };
    }, [tracks]);

    if (!chartData) {
        return (
            <div className={cn(
                'py-10',
                'text-center',
                'text-gray-600',
                'bg-gray-100',
                'dark:bg-gray-800',
                'rounded-lg'
            )}>
                <p>Nenhum dado disponível para o gráfico</p>
            </div>
        );
    }

    return (
        <div className={cn(
            'p-5',
            'bg-white',
            'dark:bg-gray-800',
            'rounded-lg',
            'shadow-md'
        )}>
            <h3 className={cn(
                'mt-0',
                'mb-5',
                'text-lg',
                'font-bold',
                'text-center',
                'text-gray-900',
                'dark:text-gray-100'
            )}>
                Artistas Mais Ouvidos
            </h3>
            <div className={cn(
                'flex',
                'justify-center',
                'items-center',
                'min-h-[300px]'
            )}>
                <Pie
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: {
                                        size: 12
                                    },
                                    color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'rgba(0, 0, 0, 0.8)',
                                titleColor: isDark ? 'rgb(209, 213, 219)' : 'rgb(255, 255, 255)',
                                bodyColor: isDark ? 'rgb(209, 213, 219)' : 'rgb(255, 255, 255)',
                                borderColor: isDark ? 'rgb(75, 85, 99)' : 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1,
                                callbacks: {
                                    label: (context) => {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${label}: ${value} ${value === 1 ? 'música' : 'músicas'} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default ChartPie;

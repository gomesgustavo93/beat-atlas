import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box } from '@mui/material';
import { cn } from '../../utils/cn';

interface IInputSearchProps {
    query: string;
    selectedTypes: string[];
    onQueryChange: (query: string) => void;
    onTypesChange: (types: string[]) => void;
    isLoading?: boolean;
    error?: Error | null;
}

function InputSearch({ query, selectedTypes, onQueryChange, onTypesChange, isLoading, error }: IInputSearchProps) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const SEARCH_TYPES = [
        { value: 'artist', label: t('search.types.artist') },
        { value: 'track', label: t('search.types.track') },
        { value: 'album', label: t('search.types.album') },
    ];

    const handleTypeChange = (event: { target: { value: unknown } }) => {
        const value = event.target.value;
        const newTypes = typeof value === 'string' ? value.split(',') : (value as string[]);
        if (newTypes.length === 0) {
            onTypesChange(['artist']);
        } else {
            onTypesChange(newTypes);
        }
    };

    return (
        <div className={cn(
            'mb-8',
            'p-5',
            'bg-white',
            'dark:bg-gray-800',
            'rounded-lg',
            'border',
            'border-gray-200',
            'dark:border-gray-700',
            'shadow-sm'
        )}>
            <div className={cn(
                'flex',
                'gap-5',
                'flex-wrap',
                'items-start'
            )}>
                <TextField
                    fullWidth
                    label={t('search.label')}
                    placeholder={t('search.placeholder')}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    variant="outlined"
                    sx={{
                        flex: '1 1 300px',
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'white',
                            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                            '& fieldset': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#1DB954',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: isDark ? 'rgb(209, 213, 219)' : 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                                color: '#1DB954',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                        },
                    }}
                />

                {/* Multiselect de tipos */}
                <FormControl sx={{ minWidth: 200, flex: '0 1 250px' }}>
                    <InputLabel
                        id="search-types-label"
                        sx={{
                            color: isDark ? 'rgb(209, 213, 219)' : 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                                color: '#1DB954', // green-500
                            },
                        }}
                    >
                        {t('search.typesLabel')}
                    </InputLabel>
                    <Select
                        labelId="search-types-label"
                        id="search-types"
                        multiple
                        value={selectedTypes}
                        onChange={handleTypeChange}
                        label={t('search.typesLabel')}
                        sx={{
                            backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'white',
                            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1DB954',
                            },
                            '& .MuiSelect-icon': {
                                color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
                            },
                        }}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((value) => {
                                    const type = SEARCH_TYPES.find(t => t.value === value);
                                    return (
                                        <Chip
                                            key={value}
                                            label={type?.label || value}
                                            size="small"
                                            sx={{
                                                backgroundColor: isDark ? 'rgba(29, 185, 84, 0.2)' : 'rgba(29, 185, 84, 0.1)',
                                                color: '#1DB954',
                                                '& .MuiChip-deleteIcon': {
                                                    color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                                                },
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        )}
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
                        {SEARCH_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {isLoading && query.trim().length > 0 && (
                <div className={cn(
                    'mt-2.5',
                    'text-sm',
                    'text-gray-600',
                    'dark:text-gray-400'
                )}>
                    {t('search.searching')}
                </div>
            )}

            {error && (
                <div className={cn(
                    'mt-2.5',
                    'text-sm',
                    'text-red-600',
                    'dark:text-red-400'
                )}>
                    {t('search.error')}: {error.message}
                </div>
            )}
        </div>
    );
}

export default InputSearch;

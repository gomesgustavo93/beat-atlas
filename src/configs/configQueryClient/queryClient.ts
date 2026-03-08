import { QueryClient } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60 * 5; // 5 minutos

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: STALE_TIME,
        },
    },
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { UserProvider } from './contexts/UserContext/UserContext'
import { queryClient } from './configs/configQueryClient/queryClient.ts'
import { router } from './routes'
import './i18n'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  </StrictMode>,
)

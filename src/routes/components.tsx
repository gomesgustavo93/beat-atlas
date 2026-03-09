import { Navigate } from 'react-router-dom'
import { isAuthenticated as isAuthenticatedService } from '../services/oauthService'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isAuthenticatedService()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isAuthenticatedService()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

export const RootRoute = () => {
  const isAuthenticated = isAuthenticatedService()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <Navigate to="/login" replace />
}

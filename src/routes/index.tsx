import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Home, Login, Callback, FollowedArtists, DetailsArtist, Favorites, MyMusics } from '../pages';
import PageLayout from '../components/PageLayout/PageLayout';
import { isAuthenticated as isAuthenticatedService } from '../services/oauthService';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isAuthenticatedService();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isAuthenticatedService();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const RootRoute = () => {
  const isAuthenticated = isAuthenticatedService();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/callback',
    element: <Callback />,
  },
  {
    element: (
      <ProtectedRoute>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/followed-artists',
        element: <FollowedArtists />,
      },
      {
        path: '/details-artist/:id',
        element: <DetailsArtist />,
      },
      {
        path: '/favorites',
        element: <Favorites />,
      },
      {
        path: '/my-musics',
        element: <MyMusics />,
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

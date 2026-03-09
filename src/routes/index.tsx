import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  Home,
  Login,
  Callback,
  FollowedArtists,
  DetailsArtist,
  Favorites,
  MyMusics,
} from '../pages'
import PageLayout from '../components/PageLayout/PageLayout'
import { ProtectedRoute, PublicRoute, RootRoute } from './components'

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
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

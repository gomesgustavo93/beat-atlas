import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import {
  isAuthenticated as isAuthenticatedService,
  getUserProfile as getUserProfileService,
} from '../../services/oauthService'
import type {
  IUserState,
  TUserAction,
  IUserProfile,
  IUserContextType,
} from './UserContext.types'

const initialState: IUserState = {
  profile: null,
  loading: false,
  error: null,
}

function userReducer(state: IUserState, action: TUserAction): IUserState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      }
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        profile: null,
      }
    case 'CLEAR_USER':
      return {
        ...initialState,
      }
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      }
    default:
      return state
  }
}

const UserContext = createContext<IUserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState)

  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticatedService()) {
      dispatch({ type: 'CLEAR_USER' })
      return
    }

    dispatch({ type: 'FETCH_START' })
    try {
      const profile = await getUserProfileService()
      dispatch({ type: 'FETCH_SUCCESS', payload: profile })
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Erro ao buscar perfil do usuário',
      })
    }
  }, [])

  const clearUser = useCallback(() => {
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  const updateProfile = useCallback((updates: Partial<IUserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates })
  }, [])

  useEffect(() => {
    if (isAuthenticatedService()) {
      fetchUserProfile()
    } else {
      clearUser()
    }
  }, [fetchUserProfile, clearUser])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotify_user_token') {
        if (isAuthenticatedService()) {
          fetchUserProfile()
        } else {
          clearUser()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchUserProfile, clearUser])

  return (
    <UserContext.Provider
      value={{
        state,
        fetchUserProfile,
        clearUser,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider')
  }
  return context
}

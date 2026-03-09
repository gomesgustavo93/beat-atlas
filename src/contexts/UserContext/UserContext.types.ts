export interface IUserProfile {
  id: string
  display_name: string
  email: string
  images: Array<{ url: string }>
}

export interface IUserState {
  profile: IUserProfile | null
  loading: boolean
  error: string | null
}

export type TUserAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: IUserProfile }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<IUserProfile> }

export interface IUserContextType {
  state: IUserState
  fetchUserProfile: () => Promise<void>
  clearUser: () => void
  updateProfile: (updates: Partial<IUserProfile>) => void
}

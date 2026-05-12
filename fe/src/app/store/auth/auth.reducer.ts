import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { token, user }) => {
    localStorage.setItem('token', token);
    return { ...state, token, user, loading: false };
  }),

  on(AuthActions.registerSuccess, (state, { token, user }) => {
    localStorage.setItem('token', token);
    return { ...state, token, user, loading: false };
  }),

  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
  })),

  on(AuthActions.logout, () => {
    localStorage.removeItem('token');
    return { user: null, token: null, loading: false, error: null };
  }),
  on(AuthActions.logout, (state) => ({ ...state, loading: true })),

  on(AuthActions.logoutSuccess, () => {
    localStorage.removeItem('token');
    return { user: null, token: null, loading: false, error: null };
  }),
);

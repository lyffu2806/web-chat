import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login', props<{ username: string; password: string }>());
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: string; user: any }>(),
);
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const register = createAction(
  '[Auth] Register',
  props<{ email: string; username: string; password: string }>(),
);
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ token: string; user: any }>(),
);
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');

export const loadUser = createAction('[Auth] Load User');
export const loadUserSuccess = createAction('[Auth] Load User Success', props<{ user: any }>());
export const logoutSuccess = createAction('[Auth] Logout Success'); 

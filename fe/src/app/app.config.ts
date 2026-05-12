import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { chatReducer } from './store/chat/chat.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ChatEffects } from './store/chat/chat.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideStore({ auth: authReducer, chat: chatReducer }),
    provideEffects([AuthEffects, ChatEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
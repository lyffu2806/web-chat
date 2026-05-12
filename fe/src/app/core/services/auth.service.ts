import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LoginPayload {
  username: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload) {
    return this.http.post<{ access_token: string; user: any }>(`${this.api}/login`, payload);
  }
  
  logout() {
    return this.http.post(`${this.api}/logout`, {});
  }

  register(payload: RegisterPayload) {
    return this.http.post<{ access_token: string }>(`${this.api}/register`, payload);
  }

  getMe() {
    return this.http.get<any>(`${this.api}/me`);
  }
}

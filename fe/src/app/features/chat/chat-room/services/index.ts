import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  layThongTinUser() {
    const url = `${environment.apiUrl}/users/me`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  guiHeartbeat() {
    const url = `${environment.apiUrl}/auth/heartbeat`;
    return this.http.post<any>(url, {}, { headers: this.getAuthHeaders() });
  }

  danhSachUserOnline(page: number, limit: number) {
    const url = `${environment.apiUrl}/users/online?page=${page}&limit=${limit}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  dangXuat() {
    const url = `${environment.apiUrl}/auth/logout`;
    return this.http.post<any>(url, {}, { headers: this.getAuthHeaders() });
  }
}
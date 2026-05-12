import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  getRooms() {
    return this.http.get<any[]>(`${this.api}/rooms`);
  }

  createRoom(name: string, memberIds: string[]) {
    return this.http.post<any>(`${this.api}/rooms`, { name, memberIds });
  }

  getMessages(roomId: string, limit = 50, offset = 0) {
    return this.http.get<any[]>(
      `${this.api}/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`,
    );
  }
}
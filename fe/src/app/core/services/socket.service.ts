import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private newMessage$ = new Subject<any>();

  newMessage = this.newMessage$.asObservable();

  connect() {
    if (this.socket?.connected) return;
    const token = localStorage.getItem('token');
    const socketUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => console.log('Socket connected!'));
    this.socket.on('connect_error', (err) => console.log('Socket error:', err.message));

    this.socket.on('newMessage', (msg) => {
      this.newMessage$.next(msg);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  sendMessage(receiverId: string, content: string) {
    this.socket?.emit('sendMessage', { receiverId, content });
  }
}
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { io, Socket } from 'socket.io-client';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { selectToken } from '../../store/auth/auth.selectors';
import * as ChatActions from '../../store/chat/chat.actions';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  connect(): void {
    this.store.select(selectToken).pipe(takeUntil(this.destroy$)).subscribe((token) => {
      if (!token || this.socket?.connected) return;

      this.socket = io(`${environment.wsUrl}/chat`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.registerEvents();
    });
  }

  private registerEvents(): void {
    if (!this.socket) return;

    this.socket.on('message:new', (message) => {
      this.store.dispatch(ChatActions.messageReceived({ message }));
    });

    this.socket.on('typing:start', (data) => {
      this.store.dispatch(ChatActions.typingStart(data));
    });

    this.socket.on('typing:stop', (data) => {
      this.store.dispatch(ChatActions.typingStop(data));
    });

    this.socket.on('user:online', (data) => {
      this.store.dispatch(ChatActions.userOnline(data));
    });

    this.socket.on('user:offline', (data) => {
      this.store.dispatch(ChatActions.userOffline(data));
    });
  }

  joinRoom(roomId: string): void {
    this.socket?.emit('room:join', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('room:leave', { roomId });
  }

  sendMessage(roomId: string, content: string, type = 'text'): void {
    this.socket?.emit('message:send', { roomId, content, type });
  }

  startTyping(roomId: string): void {
    this.socket?.emit('typing:start', { roomId });
  }

  stopTyping(roomId: string): void {
    this.socket?.emit('typing:stop', { roomId });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
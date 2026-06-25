import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { ChatService } from './services/index';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.scss',
})
export class ChatRoom implements OnInit, OnDestroy {
  private store = inject(Store);
  private chatService = inject(ChatService);
  private router = inject(Router);

  users: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  user$ = this.store.select((s: any) => s.auth.user);
  heartbeatInterval: any;
  currentUser: { username: string } | null = null;

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsers();
    this.startHeartbeat();
  }

  loadCurrentUser() {
    this.store
      .select((s: any) => s.auth.user)
      .subscribe((user) => {
        if (user) {
          this.currentUser = user;
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            // Gọi API lấy username thật
            this.chatService.layThongTinUser().subscribe((res) => {
              this.currentUser = { username: res.username };
            });
          }
        }
      });
  }

  startHeartbeat() {
    const sendHeartbeat = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      this.chatService.guiHeartbeat().subscribe();
    };

    sendHeartbeat();
    this.heartbeatInterval = setInterval(sendHeartbeat, 60000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') sendHeartbeat();
    });
  }

  loadUsers() {
    this.loading = true;
    this.chatService.danhSachUserOnline(this.page, this.limit).subscribe({
      next: (res) => {
        this.users = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  openChat(userId: string) {
    this.router.navigate(['/chat/messages', userId]); // ← navigate sang chatbox
  }

  logout() {
    this.chatService.dangXuat().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/auth/login']);
      },
    });
  }

  getLastSeen(lastSeen: string): string {
    if (!lastSeen) return 'Không rõ';
    const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000 / 60);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  }

  ngOnDestroy() {
    clearInterval(this.heartbeatInterval);
  }
}

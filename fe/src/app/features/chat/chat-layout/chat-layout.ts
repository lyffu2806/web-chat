import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.scss',
})
export class ChatLayout implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private socketService = inject(SocketService);
  private msgSub!: Subscription;
  private unreadInterval: any;

  totalUnread = 0;

  get token() {
    return localStorage.getItem('token');
  }

  ngOnInit() {
    this.socketService.connect();
    this.loadUnread();

    this.msgSub = this.socketService.newMessage.subscribe(() => {
      this.loadUnread();
    });
    this.unreadInterval = setInterval(() => this.loadUnread(), 10000);
  }

  loadUnread() {
    this.http
      .get<any[]>(`${environment.apiUrl}/messages/conversations`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((res) => {
        this.totalUnread = res.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      });
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
    clearInterval(this.unreadInterval);
  }

  logout() {
    const token = localStorage.getItem('token');
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => { localStorage.removeItem('token'); this.router.navigate(['/auth/login']); },
      error: () => { localStorage.removeItem('token'); this.router.navigate(['/auth/login']); },
    });
  }
}
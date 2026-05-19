import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { take } from 'rxjs/operators';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageList implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  @ViewChild('msgEnd') msgEnd!: ElementRef;

  private msgSub!: Subscription;

  currentUserId = '';
  conversations: any[] = [];
  activeUser: any = null;
  messages: any[] = [];
  newMessage = '';
  loading = false;

  ngOnInit() {
    // Decode JWT sync
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.sub;
      } catch {}
    }

    this.store
      .select((s: any) => s.auth.user)
      .subscribe((u: any) => {
        if (u?.id) this.currentUserId = u.id;
      });

    // Kết nối socket
    this.socketService.connect();
    this.msgSub = this.socketService.newMessage.subscribe((msg) => {
      if (
        this.activeUser &&
        (msg.senderId === this.activeUser.id || msg.receiverId === this.activeUser.id)
      ) {
        this.messages.push(msg);
        setTimeout(() => this.scrollToBottom(), 50);
      }
      this.loadConversations();
    });

    this.loadConversations();
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['userId']) this.openChatWithId(params['userId']);
    });
  }

  get token() {
    return localStorage.getItem('token');
  }

  loadConversations() {
    this.http
      .get<any[]>(`${environment.apiUrl}/messages/conversations`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((res) => (this.conversations = res));
  }

  openChatWithId(userId: string) {
    if (this.activeUser?.id === userId) return;
    this.http
      .get<any>(`${environment.apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((user) => this.openChat(user));
  }

  openChat(user: any) {
    this.activeUser = user;
    this.loadMessages();

    // Mark đã đọc
    this.http
      .post(
        `${environment.apiUrl}/messages/read/${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${this.token}` } },
      )
      .subscribe(() => this.loadConversations()); // reload để reset badge
  }

  loadMessages() {
    if (!this.activeUser) return;
    this.http
      .get<any[]>(`${environment.apiUrl}/messages/conversation/${this.activeUser.id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((res) => {
        this.messages = res;
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeUser) return;
    this.socketService.sendMessage(this.activeUser.id, this.newMessage);
    this.newMessage = '';
  }

  scrollToBottom() {
    this.msgEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  closeChat() {
    this.activeUser = null;
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }

  getMessageTime(createdAt: string): string {
    if (!createdAt) return '';

    const utc = new Date(createdAt);
    const diff = Math.floor((Date.now() - utc.getTime()) / 1000 / 60);

    const timeStr = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(utc);

    const todayVN = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date());

    const msgDayVN = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(utc);

    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    if (msgDayVN === todayVN) return timeStr;

    const dateStr = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(utc);

    return `${dateStr} ${timeStr}`;
  }
}

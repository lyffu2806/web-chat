import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageList implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  @ViewChild('msgEnd') msgEnd!: ElementRef;

  user$ = this.store.select((s: any) => s.auth.user);
  currentUserId = '';

  conversations: any[] = [];
  activeUser: any = null;
  messages: any[] = [];
  newMessage = '';
  loading = false;
  private pollInterval: any;

  ngOnInit() {
    this.store
      .select((s: any) => s.auth.user)
      .subscribe((u: any) => {
        if (u) {
          this.currentUserId = u.id;
          console.log('currentUserId:', this.currentUserId); // ← kiểm tra
        }
      });

    this.loadConversations();

    this.route.params.subscribe((params) => {
      if (params['userId']) {
        this.openChatWithId(params['userId']);
      }
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
    this.http
      .get<any>(`${environment.apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((user) => {
        this.openChat(user);
      });
  }

  openChat(user: any) {
    this.activeUser = user;
    this.loadMessages();
    clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.loadMessages(), 3000);
  }

  loadMessages() {
    if (!this.activeUser) return;
    this.http
      .get<any[]>(`${environment.apiUrl}/messages/conversation/${this.activeUser.id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe((res) => {
        this.messages = res;
        console.log('currentUserId khi load messages:', this.currentUserId);
        console.log('senderId tin nhắn đầu:', res[0]?.senderId);
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeUser) return;
    this.http
      .post(
        `${environment.apiUrl}/messages/send`,
        { receiverId: this.activeUser.id, content: this.newMessage },
        { headers: { Authorization: `Bearer ${this.token}` } },
      )
      .subscribe(() => {
        this.newMessage = '';
        this.loadMessages();
        this.loadConversations();
      });
  }

  scrollToBottom() {
    this.msgEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  closeChat() {
    this.activeUser = null;
    clearInterval(this.pollInterval);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }
}

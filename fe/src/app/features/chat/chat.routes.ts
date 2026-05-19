import { Routes } from '@angular/router';
import { ChatLayout } from './chat-layout/chat-layout';
import { ChatRoom } from './chat-room/chat-room';
import { MessageList } from './message-list/message-list';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    component: ChatLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: ChatRoom },
      { path: 'messages', component: MessageList },
      { path: 'messages/:userId', component: MessageList },
    ]
  }
];
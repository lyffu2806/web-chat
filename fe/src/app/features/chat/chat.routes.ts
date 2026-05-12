import { Routes } from '@angular/router';
import { ChatRoom } from './chat-room/chat-room';
import { MessageList } from './message-list/message-list';

export const CHAT_ROUTES: Routes = [
  { path: '', component: ChatRoom },
  { path: 'messages', component: MessageList },
  { path: 'messages/:userId', component: MessageList },
];
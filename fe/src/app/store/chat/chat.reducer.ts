import { createReducer, on } from '@ngrx/store';
import * as ChatActions from './chat.actions';

export interface ChatState {
  messages: any[];
  typingUsers: string[];
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
}

export const initialState: ChatState = {
  messages: [],
  typingUsers: [],
  onlineUsers: [],
  loading: false,
  error: null,
};

export const chatReducer = createReducer(
  initialState,
  on(ChatActions.loadMessages, (state) => ({ ...state, loading: true })),
  on(ChatActions.loadMessagesSuccess, (state, { messages }) => ({
    ...state, messages, loading: false,
  })),
  on(ChatActions.loadMessagesFailure, (state, { error }) => ({
    ...state, error, loading: false,
  })),
  on(ChatActions.messageReceived, (state, { message }) => ({
    ...state, messages: [...state.messages, message],
  })),
  on(ChatActions.sendMessageSuccess, (state, { message }) => ({
    ...state, messages: [...state.messages, message],
  })),
  on(ChatActions.typingStart, (state, { userId }) => ({
    ...state,
    typingUsers: state.typingUsers.includes(userId)
      ? state.typingUsers
      : [...state.typingUsers, userId],
  })),
  on(ChatActions.typingStop, (state, { userId }) => ({
    ...state,
    typingUsers: state.typingUsers.filter((id) => id !== userId),
  })),
  on(ChatActions.userOnline, (state, { userId }) => ({
    ...state, onlineUsers: [...state.onlineUsers, userId],
  })),
  on(ChatActions.userOffline, (state, { userId }) => ({
    ...state, onlineUsers: state.onlineUsers.filter((id) => id !== userId),
  }))
);
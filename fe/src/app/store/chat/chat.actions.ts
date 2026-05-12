import { createAction, props } from '@ngrx/store';

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ roomId: string; content: string }>()
);
export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ message: any }>()
);
export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string }>()
);

export const loadMessages = createAction(
  '[Chat] Load Messages',
  props<{ roomId: string }>()
);
export const loadMessagesSuccess = createAction(
  '[Chat] Load Messages Success',
  props<{ messages: any[] }>()
);
export const loadMessagesFailure = createAction(
  '[Chat] Load Messages Failure',
  props<{ error: string }>()
);

export const messageReceived = createAction(
  '[Chat] Message Received',
  props<{ message: any }>()
);
export const typingStart = createAction(
  '[Chat] Typing Start',
  props<{ userId: string; roomId: string }>()
);
export const typingStop = createAction(
  '[Chat] Typing Stop',
  props<{ userId: string; roomId: string }>()
);
export const userOnline = createAction(
  '[Chat] User Online',
  props<{ userId: string }>()
);
export const userOffline = createAction(
  '[Chat] User Offline',
  props<{ userId: string }>()
);
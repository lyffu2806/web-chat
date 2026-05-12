import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ChatActions from './chat.actions';
import { ChatService } from '../../core/services/chat.service';

export class ChatEffects {
  private actions$ = inject(Actions);
  private chatService = inject(ChatService);

  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadMessages),
      switchMap(({ roomId }) =>
        this.chatService.getMessages(roomId).pipe(
          map((messages: any[]) => ChatActions.loadMessagesSuccess({ messages })),
          catchError((err) => of(ChatActions.loadMessagesFailure({ error: err.message })))
        )
      )
    )
  );
}
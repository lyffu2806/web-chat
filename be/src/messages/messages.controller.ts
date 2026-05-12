import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('send')
  send(@Request() req: any, @Body() body: { receiverId: string; content: string }) {
    return this.messagesService.sendMessage(req.user.sub, body.receiverId, body.content);
  }

  @Get('conversation/:otherId')
  getMessages(@Request() req: any, @Param('otherId') otherId: string) {
    return this.messagesService.getMessages(req.user.sub, otherId);
  }

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.sub);
  }
}
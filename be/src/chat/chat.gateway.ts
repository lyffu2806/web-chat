import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map userId -> socketId
  private userSockets = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth['token'];
      const payload = this.jwtService.verify(token);
      client.data['userId'] = payload.sub;
      this.userSockets.set(payload.sub, client.id);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data['userId'];
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      receiverId: string;
      content: string;
      type?: string;
      fileUrl?: string;
    },
  ) {
    const senderId = client.data['userId'];
    const message = await this.messagesService.sendMessage(
      senderId,
      data.receiverId,
      data.content,
      data.type || 'text',
      data.fileUrl,
    );

    // Gửi cho receiver nếu đang online
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
    }

    // Gửi lại cho sender để confirm
    client.emit('newMessage', message);

    return message;
  }
}

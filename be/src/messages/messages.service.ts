import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const message = this.messagesRepository.create({ senderId, receiverId, content });
    return this.messagesRepository.save(message);
  }

  // Lấy tin nhắn giữa 2 người
  async getMessages(userId: string, otherId: string) {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  // Lấy danh sách conversation (những người đã nhắn tin)
  async getConversations(userId: string) {
    const messages = await this.messagesRepository
      .createQueryBuilder('m')
      .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .orderBy('m.createdAt', 'DESC')
      .getMany();

    // Lấy unique user từ conversations
    const seen = new Set<string>();
    const conversations: any[] = [];

    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!seen.has(other.id)) {
        seen.add(other.id);
        conversations.push({
          user: { id: other.id, username: other.username, isOnline: other.isOnline },
          lastMessage: { content: msg.content, createdAt: msg.createdAt },
        });
      }
    }
    return conversations;
  }
}
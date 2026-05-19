import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/message.entity';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ep-holy-brook-ao4au6q4-pooler.c-2.ap-southeast-1.aws.neon.tech',
      port: 5432,
      username: 'neondb_owner',
      password: 'npg_idsQ36vUnxqR',
      database: 'neondb',
      entities: [User, Message],
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    ChatModule,
  ],
})
export class AppModule {}

import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.sub);
  }

  @Get('conversation/:otherId')
  getMessages(@Request() req: any, @Param('otherId') otherId: string) {
    return this.messagesService.getMessages(req.user.sub, otherId);
  }

  @Post('send')
  sendMessage(
    @Request() req: any,
    @Body() body: { receiverId: string; content: string },
  ) {
    return this.messagesService.sendMessage(
      req.user.sub,
      body.receiverId,
      body.content,
    );
  }

  @Post('read/:senderId')
  markAsRead(@Request() req: any, @Param('senderId') senderId: string) {
    return this.messagesService.markAsRead(req.user.sub, senderId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
      fileFilter: (req, file, cb) => {
        const allowed = /image|video|audio/;
        const ok = allowed.test(file.mimetype);
        cb(null, ok);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }
}

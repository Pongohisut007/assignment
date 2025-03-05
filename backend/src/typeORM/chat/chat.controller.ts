import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getAllChat() {
    return this.chatService.getAllChat();
  }

}
 
// src/typeORM/chatHistory/chat-history.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { Gateway } from '../../gateway/gateway';

@Controller('openai')
export class ChatHistoryController {
  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly gateway: Gateway,
  ) {}

  @Post('process-text')
  async processText(
    @Body('userId') userId: string,
    @Body('prompt') prompt: string,
  ) {
    if (!userId || !prompt) {
      throw new BadRequestException('userId and prompt are required');
    }

    try {
      const response = await this.chatHistoryService.processPrompt(
        +userId,
        prompt,
      );
      console.log('GPT-4o-mini response:', response);

      const room = `user_${userId}`;
      this.gateway.server.to(room).emit('onLog', {
        prompt,
        response,
        timestamp: new Date().toISOString(),
      });

      const history = await this.chatHistoryService.findByUser(+userId);
      this.gateway.server.to(room).emit('chatHistory', history);

      return { prompt, response }; // ส่งคืน JSON
    } catch (error) {
      throw new BadRequestException(
        'Failed to process prompt: ' + error.message,
      );
    }
  }
}

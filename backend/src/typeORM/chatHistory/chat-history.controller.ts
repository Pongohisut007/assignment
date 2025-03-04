// src/typeORM/chatHistory/chat-history.controller.ts
import { Body, Controller, Post, BadRequestException } from "@nestjs/common";
import { ChatHistoryService } from "./chat-history.service";

@Controller('openai')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Post('getresponse')
  async getResponse(@Body() body: { userId: number; prompt: string }) {
    const { userId, prompt } = body;
    if (!userId || !prompt) {
      throw new BadRequestException('userId and prompt are required');
    }
    try {
      const response = await this.chatHistoryService.getChatGPTresponse(userId, prompt);
      return { response };
    } catch (error) {
      throw new BadRequestException('Failed to get AI response');
    }
  }
}
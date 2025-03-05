// src/typeORM/chatHistory/chat-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './chat-history.entity';
import { Users } from '../users/users.entity';
import OpenAI from 'openai';
import { PubSub } from '@google-cloud/pubsub';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatHistoryService {
  private openai: OpenAI;
  private pubSubClient = new PubSub({ keyFilename: './service-account.json' });
  private topicName = 'chat-logs';

  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
    private readonly usersService: UsersService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getChatGPTresponse(userId: number, prompt: string): Promise<string> {
    const history = await this.findByUser(userId);
    const messages = history
      .map(entry => [
        { role: 'user', content: entry.prompt },
        { role: 'assistant', content: entry.response },
      ])
      .flat() as Array<{ role: 'user' | 'assistant'; content: string }>;

    messages.push({ role: 'user', content: prompt });

    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
        max_tokens: 100,
      });
      return completion.choices[0].message.content ?? 'No response from AI';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get ChatGPT response');
    }
  }

  async processPrompt(userId: number, prompt: string): Promise<string> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new Error('User not found');

    const response = await this.getChatGPTresponse(userId, prompt);
    const chatEntry = await this.create(user, prompt, response);

    const logData = {
      userId,
      prompt,
      response,
      timestamp: chatEntry.timestamp,
    };

    await this.publishLog(logData); // Publish ไป Pub/Sub
    return response;
  }

  async create(user: Users, prompt: string, response: string): Promise<ChatHistory> {
    const chatEntry = this.chatHistoryRepository.create({
      user,
      prompt,
      response,
    });
    return this.chatHistoryRepository.save(chatEntry);
  }

  async findByUser(userId: number): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.find({
      where: { user: { user_id: userId } },
      order: { timestamp: 'ASC' },
    });
  }

  private async publishLog(logData: any) {
    const dataBuffer = Buffer.from(JSON.stringify(logData));
    try {
      const messageId = await this.pubSubClient
        .topic(this.topicName)
        .publishMessage({ data: dataBuffer });
      console.log(`Log published with ID: ${messageId}`);
    } catch (error) {
      console.error('Error publishing log:', error);
    }
  }
}
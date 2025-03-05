import { Injectable } from '@nestjs/common';
import { Chat } from './chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(data: any) {
    const newMessage = this.chatRepository.create({
      owner: { user_id: data.owner },
      room: { room_id: data.room_id },
      message: data.message,
    });
    return await this.chatRepository.save(newMessage);
  }

  async getChatGPTresponse(content: any): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'assistant', content: content }],
        model: 'gpt-4o-mini',
        max_tokens: 500,
      });
      return completion.choices[0].message.content ?? 'No response from AI';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get ChatGPT response');
    }
  }
}

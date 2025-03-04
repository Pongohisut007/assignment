// src/typeORM/chatHistory/chat-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './chat-history.entity';
import { Users } from '../users/users.entity';
import OpenAI from 'openai'; // เปลี่ยนการ import ให้ตรงกับ SDK ล่าสุด

@Injectable()
export class ChatHistoryService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
  ) {
    this.openai = new OpenAI({
      apiKey: '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',
    });
  }

  async getChatGPTresponse(userId: number, prompt: string): Promise<string> {
    const history = await this.findByUser(userId);

    // กำหนด messages array โดยใช้โครงสร้างที่ OpenAI คาดหวัง
    const messages = history.map(entry => [
      { role: "user", content: entry.prompt },
      { role: "assistant", content: entry.response },
    ]).flat() as Array<{ role: "user" | "assistant"; content: string }>;

    // เพิ่ม prompt ปัจจุบัน
    messages.push({ role: "user", content: prompt });

    try {
      const completion = await this.openai.chat.completions.create({
        messages, // ส่งประวัติทั้งหมดพร้อม prompt ใหม่
        model: "gpt-4o-mini",
        max_tokens: 100,
      });
      return completion.choices[0].message.content ?? 'No response from AI';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get ChatGPT response');
    }
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
}
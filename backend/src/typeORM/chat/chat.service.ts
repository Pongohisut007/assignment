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

async create(data: any): Promise<any> {
    // สร้าง newMessage โดยกำหนด relation
    const newMessage = this.chatRepository.create({
      owner: { user_id: data.owner }, // กำหนด owner เป็น object ที่มี user_id
      room: { room_id: data.room_id }, // กำหนด room เป็น object ที่มี room_id
      message: data.message,
    });

    // บันทึกข้อมูลลงฐานข้อมูล
    const savedMessage = await this.chatRepository.save(newMessage);

    // โหลดข้อมูลพร้อม relation (owner และ room) หลังบันทึก
    const populatedMessage = await this.chatRepository.findOne({
      where: { chat_id: savedMessage.chat_id },
      relations: ['owner', 'room'], // Populate owner และ room
    });

    console.log("popuuuuuuu", populatedMessage)

    return populatedMessage;
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

  async getAllChat() {
    return this.chatRepository.find({relations:['owner', 'room']});
  }
}

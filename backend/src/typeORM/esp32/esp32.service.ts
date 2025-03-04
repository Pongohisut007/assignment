import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { ChatHistoryService } from '../chatHistory/chat-history.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ESP32Service {
  private openai: OpenAI;
  private shouldDownloadFile: boolean = false;

  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly usersService: UsersService,
  ) {
    this.openai = new OpenAI({ apiKey: 'YOUR_OPENAI_API_KEY' });
  }

  async speechToText(recordFilePath: string): Promise<string> {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(recordFilePath),
        model: 'whisper-1',
        response_format: 'text',
      });
      console.log('YOU:', transcription);
      return transcription;
    } catch (error) {
      console.error('Error in speechToText:', error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  async textToAI(text: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: text }],
        model: 'gpt-3.5-turbo',
        max_tokens: 30,
      });
      const gptResponse = completion.choices[0].message.content;
      console.log('ChatGPT:', gptResponse);
      // @ts-ignore
      return gptResponse;
    } catch (error) {
      console.error('Error calling GPT:', error.message);
      throw new Error('Failed to get AI response');
    }
  }

  async textToSpeech(gptResponse: string): Promise<void> {
    try {
      const voicedFilePath = path.resolve('./resources/voicedby.wav');
      const wav = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'echo',
        input: gptResponse,
        response_format: 'wav',
      });

      const buffer = Buffer.from(await wav.arrayBuffer());
      await fs.promises.writeFile(voicedFilePath, buffer);
      console.log('Audio file saved:', voicedFilePath);
      this.shouldDownloadFile = true;
    } catch (error) {
      console.error('Error in textToSpeech:', error.message);
      throw new Error('Failed to generate speech');
    }
  }

  async saveChatHistory(
    userId: number,
    prompt: string,
    response: string,
  ): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (user) {
      await this.chatHistoryService.create(user, prompt, response);
      // ส่งประวัติไปยัง frontend ผ่าน WebSocket (ถ้าต้องการ)
      const room = `user_${userId}`;
      const history = await this.chatHistoryService.findByUser(userId);
      // คุณสามารถ emit ไปยัง WebSocket ได้ที่นี่ถ้าต้องการ
    }
  }

  isSpeechReady(): boolean {
    return this.shouldDownloadFile;
  }
}

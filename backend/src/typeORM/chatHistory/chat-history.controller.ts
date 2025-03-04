import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatHistoryService } from './chat-history.service';
import { Gateway } from '../../gateway/gateway';
import axios from 'axios';
import { Response } from 'express';

@Controller('openai')
export class ChatHistoryController {
  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly gateway: Gateway,
  ) {}

  @Post('process-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async processAudio(
    @UploadedFile() audio: Express.Multer.File,
    @Body('userId') userId: string,
    @Res() res: Response,
  ) {
    if (!userId || !audio) {
      throw new BadRequestException('userId and audio file are required');
    }

    try {
      const prompt = await this.convertAudioToText(audio.buffer);
      console.log('Transcribed text:', prompt);

      const response = await this.chatHistoryService.processPrompt(+userId, prompt);
      console.log('GPT-4o-mini response:', response);

      const audioResponse = await this.convertTextToSpeech(response);

      const room = `user_${userId}`;
      this.gateway.server.to(room).emit('onLog', {
        prompt,
        response,
        timestamp: new Date().toISOString(),
      });

      const history = await this.chatHistoryService.findByUser(+userId);
      this.gateway.server.to(room).emit('chatHistory', history);

      res.set({
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="output.wav"',
      });
      res.send(audioResponse);
    } catch (error) {
      throw new BadRequestException('Failed to process audio: ' + error.message);
    }
  }

  private async convertAudioToText(audioBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.text;
  }

  private async convertTextToSpeech(text: string): Promise<Buffer> {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: 'ash ',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      },
    );
    return Buffer.from(response.data);
  }
}

import { Controller, Post, Get, Res, HttpStatus, Body } from '@nestjs/common';
import { ESP32Service } from './esp32.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('esp32')
export class ESP32Controller {
  constructor(private readonly esp32Service: ESP32Service) {}

  @Post('uploadAudio')
  async uploadAudio(@Body() audioData: Buffer, @Res() res: Response) {
    try {
      console.log('Received audio data:', audioData, 'bytes');

      // บันทึกไฟล์เสียงชั่วคราว
      const recordFilePath = path.resolve('./resources/recording.wav');
      fs.writeFileSync(recordFilePath, audioData);

      // Speech-to-Text
      const transcription =
        await this.esp32Service.speechToText(recordFilePath);
      console.log('Transcription:', transcription);

      // ส่งไปยัง OpenAI Chat API
      const aiResponse = await this.esp32Service.textToAI(transcription);
      console.log('AI Response:', aiResponse);

      // บันทึกประวัติการสนทนา
      await this.esp32Service.saveChatHistory(1, transcription, aiResponse);

      // Text-to-Speech
      await this.esp32Service.textToSpeech(aiResponse);

      // ส่งผลลัพธ์กลับไปให้ ESP32
      res.status(HttpStatus.OK).send(`Transcription: ${transcription}`);
    } catch (error) {
      console.log(audioData);
      //console.log(res);
      console.error('Error in uploadAudio:', error.message);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Error processing audio');
    }
  }

  @Get('checkVariable')
  async checkVariable(@Res() res: Response) {
    const ready = await this.esp32Service.isSpeechReady();
    res.status(HttpStatus.OK).json({ ready });
  }

  @Get('broadcastAudio')
  async broadcastAudio(@Res() res: Response) {
    const voicedFilePath = path.resolve('./resources/voicedby.wav');

    if (!fs.existsSync(voicedFilePath)) {
      console.error('File not found');
      res.status(HttpStatus.NOT_FOUND).send('File not found');
      return;
    }

    const stat = fs.statSync(voicedFilePath);
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'audio/wav',
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(voicedFilePath);
    readStream.pipe(res);


    readStream.on('error', (err) => {
      console.error('Error reading file:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error reading file');
    });
  }
}

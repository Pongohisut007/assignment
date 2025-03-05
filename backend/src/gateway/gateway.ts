// src/gateway/gateway.ts
import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from 'src/typeORM/chat/chat.service';

@WebSocketGateway(9002, { cors: { origin: 'http://localhost:3000' } })
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket: any) => {
      console.log('New Client Connected: ', socket.id);
      socket.on('disconnect', () => {
        console.log('Client Disconnected: ', socket.id);
      });
    });
  }

  @SubscribeMessage('newMessage')
  async handleNewPrompt(
    @MessageBody()
    { user_id, prompt, data }: { user_id: number; prompt: string; data: any },
  ): Promise<any> {
    const room = `user_${user_id}`;
    console.log(`Received Prompt from User ${user_id}: ${prompt}`);

    // @mention detect
    let prePrompt = '';
    let aiResponse = '';
    let newMessage: any;
    if (data.room_name === 'sport') {
      if (
        data.message.includes('@ronaldo') ||
        data.message.includes('@เซียนบอล')
      ) {
        if (data.message.includes('@ronaldo')) {
          prePrompt =
            'PREPROMPT:ให้ตอบฉันด้วยสไตล์ cristiano ronaldo ให้แบบกวนๆ อาจจะมีคำกวนๆของ ronaldo เช่น suiiii หรืออะไรก็ได้ที่ปั่นๆ สุ่มๆกันไป';
          aiResponse = await this.chatService.getChatGPTresponse(
            `PREPROMPT:${prePrompt}MESSAGE:${data.message}`,
          );
          await this.chatService.create({
            owner:data.owner,
            room_id: 1,
            message:data.message
          })
          newMessage = await this.chatService.create({
            owner: 4,
            room_id: 1,
            message: aiResponse,
          });
        } else {
          prePrompt =
            'PREPROMPT:ให้ตอบฉันด้วยสไตล์กวนๆ ผู้เชี่ยวชาญด้านการพนันบอล สายเทาๆ ตอบกวนๆ';
          aiResponse = await this.chatService.getChatGPTresponse(
            `PREPROMPT:${prePrompt}MESSAGE:${data.message}`,
          );
          await this.chatService.create({
            owner:data.owner,
            room_id: 1,
            message:data.message
          })
          newMessage = await this.chatService.create({
            owner: 5,
            room_id: 1,
            message: aiResponse, 
          });
        }
        this.server.emit('newMessageResponse', {aiResponse, ...newMessage});
      }
      else {
        // save and send new msg
        const newMessage = await this.chatService.create({
          owner:data.owner,
          room_id:1,
          message:data.message
        });
        this.server.emit('newMessageResponse', { ...newMessage });
      }
    } else if (data.room_name === 'technology') {
      if (
        data.message.includes('@เซียนโค้ด') ||
        data.message.includes('@จารย์ปัญ')
      ) {
        if (data.message.includes('@เซียนโค้ด')) {

          prePrompt =
            'PREPROMPT:ให้ตอบฉันด้วยสไตล์ เซียนโค้ด ให้ตอบแบบ nerdๆ ตอบแบบ technical นิดหน่อยๆ มึนๆกวนๆ';
          aiResponse = await this.chatService.getChatGPTresponse(
            `PREPROMPT:${prePrompt}MESSAGE:${data.message}`,
          );
          await this.chatService.create({
            owner:data.owner,
            room_id: 2,
            message:data.message
          })
          newMessage = await this.chatService.create({
            owner: 6,
            room_id: 2,
            message: aiResponse,
          });
        } else {
          prePrompt =
            'PREPROMPT:ให้ตอบฉันด้วยสไตล์ เป็นอาจารย์ปัญ เป็นอาจารย์มหาลัย แทนตัวเองว่าอาจารย์ แทนฉันว่านักศึกษา ตอบแบบกึ่งๆทางการ อาจจะมีคำไทยแท้ ฮาๆนิดหน่อย';
          aiResponse = await this.chatService.getChatGPTresponse(
            `PREPROMPT:${prePrompt}MESSAGE:${data.message}`,
          );
          await this.chatService.create({
            owner:data.owner,
            room_id: 2,
            message:data.message
          })
          newMessage = await this.chatService.create({
            owner: 7,
            room_id: 2,
            message: aiResponse,
          });
        }
        this.server.emit('newMessageResponse', {aiResponse, ...newMessage});
      }
      else {
        // save and send new msg
        const newMessage = await this.chatService.create({
          owner:data.owner,
          room_id:2,
          message:data.message
        });
        this.server.emit('newMessageResponse', { ...newMessage });
      }
    } 
    
  }

  
}

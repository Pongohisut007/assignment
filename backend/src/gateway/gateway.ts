// src/gateway/gateway.ts
import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
// import { ChatHistoryService } from '../typeORM/chatHistory/chat-history.service';
// import { UsersService } from '../typeORM/users/users.service';
import { ChatService } from 'src/typeORM/chat/chat.service';

@WebSocketGateway(9003, { cors: { origin: 'http://localhost:3000' } })
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    // private readonly chatHistoryService: ChatHistoryService,
    // private readonly usersService: UsersService,
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

  // @SubscribeMessage('newPrompt')
  // async handleNewPrompt(
  //   @MessageBody() { userId, prompt }: { userId: number; prompt: string },
  // ): Promise<string> {
  //   const room = `user_${userId}`;
  //   console.log(`Received Prompt from User ${userId}: ${prompt}`);

  //   const user = await this.usersService.findOne(userId);
  //   if (!user) {
  //     this.server.to(room).emit('error', 'User not found');
  //     return '';
  //   }

  //   const aiResponse =
  //     await this.chatHistoryService.getChatGPTresponseAndSaveWithUserHistory(
  //       userId,
  //       prompt,
  //     );
  //   const chatEntry = await this.chatHistoryService.create(
  //     user,
  //     prompt,
  //     aiResponse,
  //   );

  //   const logData = {
  //     prompt,
  //     response: aiResponse,
  //     timestamp: chatEntry.timestamp,
  //   };

  //   this.server.to(room).emit('onLog', logData);
  //   const history = await this.chatHistoryService.findByUser(userId);
  //   this.server.to(room).emit('chatHistory', history);

  //   return aiResponse;
  // }

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
          newMessage = await this.chatService.create({
            owner: 5,
            room_id: 1,
            message: aiResponse,
          });
        }
        this.server.emit('newMessageResponse', { aiResponse });
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
          newMessage = await this.chatService.create({
            owner: 7,
            room_id: 2,
            message: aiResponse,
          });
        }
        this.server.emit('newMessageResponse', { newMessage });
      }
    } else {
      // save and send new msg
      const newMessage = await this.chatService.create(data);
      this.server.emit('newMessageResponse', { ...newMessage });
    }
    
    // this.server.emit('newMessageResponse', {
    //   user_id,
    //   response: `Received: ${prompt}, userId = ${data.prompt}`,
    // });

    // ตรวจจับ @mention

    // const chatEntry = await this.chatHistoryService.create(
    //   user,
    //   prompt,
    //   aiResponse,
    // );

    // this.server.to(room).emit('onLog', {
    //   prompt,
    //   response: aiResponse,
    //   timestamp: chatEntry.timestamp,
    // });
    // this.server
    //   .to(room)
    //   .emit('chatHistory', await this.chatHistoryService.findByUser(user_id));

    // return aiResponse;
  }

  // @SubscribeMessage('joinRoom')
  // handleJoinRoom(@MessageBody() userId: number) {
  //   const room = `user_${userId}`;
  //   this.server.socketsJoin(room);
  //   console.log(`User ${userId} joined room: ${room}`);

  //   this.chatHistoryService.findByUser(userId).then((history) => {
  //     this.server.to(room).emit('chatHistory', history);
  //   });
  // }
}

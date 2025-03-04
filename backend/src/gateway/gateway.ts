// src/gateway/gateway.ts
import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatHistoryService } from '../typeORM/chatHistory/chat-history.service';
import { UsersService } from '../typeORM/users/users.service';

@WebSocketGateway(9002, { cors: { origin: 'http://localhost:3000' } })
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket: any) => {
      console.log('New Client Connected: ', socket.id);
      socket.on('disconnect', () => {
        console.log('Client Disconnected: ', socket.id);
      });
    });
  }

  @SubscribeMessage('newPrompt')
  async handleNewPrompt(@MessageBody() { userId, prompt }: { userId: number; prompt: string }): Promise<string> {
    const room = `user_${userId}`;
    console.log(`Received Prompt from User ${userId}: ${prompt}`);

    const user = await this.usersService.findOne(userId);
    if (!user) {
      this.server.to(room).emit('error', 'User not found');
      return '';
    }

    const aiResponse = await this.chatHistoryService.getChatGPTresponse(userId, prompt);
    const chatEntry = await this.chatHistoryService.create(user, prompt, aiResponse);
    

    const logData = {
      prompt,
      response: aiResponse,
      timestamp: chatEntry.timestamp,
    };

    this.server.to(room).emit('onLog', logData);
    const history = await this.chatHistoryService.findByUser(userId);
    this.server.to(room).emit('chatHistory', history);

    return aiResponse;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() userId: number) {
    const room = `user_${userId}`;
    this.server.socketsJoin(room);
    console.log(`User ${userId} joined room: ${room}`);

    this.chatHistoryService.findByUser(userId).then(history => {
      this.server.to(room).emit('chatHistory', history);
    });
  }
}
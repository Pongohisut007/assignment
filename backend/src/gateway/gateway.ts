// src/gateway/gateway.ts
import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server ,Socket} from 'socket.io';
import { ChatService } from 'src/typeORM/chat/chat.service';

@WebSocketGateway(9002, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://nongao.lol-th-no1.com",
      "http://nongao.lol-th-no1.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"], // รองรับทั้งสอง transport
})
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
  ) {}

  onModuleInit() {
    // ดีบัก WebSocket ระดับต่ำ
    this.server.engine.on("connection", (rawSocket: any) => {
      console.log("WebSocket ระดับต่ำเชื่อมต่อ:", rawSocket.transport);
    });

    // ดีบัก Socket.IO การเชื่อมต่อ
    this.server.on("connection", (socket: Socket) => {
      console.log("Socket.IO เชื่อมต่อสำเร็จ:", socket.id, "Transport:", socket.conn.transport.name);
      socket.on("disconnect", () => {
        console.log("ไคลเอนต์ตัดการเชื่อมต่อ:", socket.id);
      });
    });

    // ดีบัก handshake
    this.server.engine.on("initial_headers", (headers, req) => {
      console.log("คำขอเริ่มต้น:", req.url, "Headers:", headers);
    });

    this.server.engine.on("connection_error", (err) => {
      console.error("ข้อผิดพลาดการเชื่อมต่อ:", err.code, err.message, err.context);
    });

    // ดีบัก handshake ล้มเหลว
    this.server.on("connect_error", (err) => {
      console.error("ข้อผิดพลาดการเชื่อมต่อเซิร์ฟเวอร์:", err);
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
        newMessage = await this.chatService.create({
          owner: data.owner,
          room_id: 1,
          message: data.message, 
        });
        this.server.emit('newMessageResponse', {...newMessage});
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
        newMessage = await this.chatService.create({
          owner: data.owner,
          room_id: 2,
          message: data.message, 
        });
        this.server.emit('newMessageResponse', {...newMessage});
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

import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatHistoryService } from "../typeORM/chatHistory/chat-history.service";
import { UsersService } from "../typeORM/users/users.service";

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
    private readonly chatHistoryService: ChatHistoryService,
    private readonly usersService: UsersService,
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

  @SubscribeMessage("newPrompt")
  async handleNewPrompt(
    @MessageBody() { userId, prompt }: { userId: number; prompt: string },
  ): Promise<string> {
    const room = `user_${userId}`;
    console.log(`รับ Prompt จากผู้ใช้ ${userId}: ${prompt}`);

    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        this.server.to(room).emit("error", "ไม่พบผู้ใช้");
        return "";
      }

      const aiResponse =
        await this.chatHistoryService.getChatGPTresponseAndSaveWithUserHistory(
          userId,
          prompt,
        );
      const chatEntry = await this.chatHistoryService.create(
        user,
        prompt,
        aiResponse,
      );

      const logData = {
        prompt,
        response: aiResponse,
        timestamp: chatEntry.timestamp,
      };

      this.server.to(room).emit("onLog", logData);
      const history = await this.chatHistoryService.findByUser(userId);
      this.server.to(room).emit("chatHistory", history);

      return aiResponse;
    } catch (error) {
      console.error("ข้อผิดพลาดใน handleNewPrompt:", error);
      this.server.to(room).emit("error", "ข้อผิดพลาดภายในเซิร์ฟเวอร์");
      return "";
    }
  }

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(@MessageBody() userId: number) {
    const room = `user_${userId}`;
    this.server.socketsJoin(room);
    console.log(`ผู้ใช้ ${userId} เข้าร่วมห้อง: ${room}`);

    try {
      const history = await this.chatHistoryService.findByUser(userId);
      this.server.to(room).emit("chatHistory", history);
    } catch (error) {
      console.error("ข้อผิดพลาดใน handleJoinRoom:", error);
      this.server.to(room).emit("error", "ไม่สามารถดึงประวัติการแชทได้");
    }
  }
}
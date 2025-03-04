import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway(9002, { cors: { origin: 'http://localhost:3000' } }) // กำหนด port และ CORS
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket: any) => {
      console.log("New Client Connected: ", socket.id);

      socket.on("disconnect", () => {
        console.log("Client Disconnected: ", socket.id);
      });
    });
  }

  @SubscribeMessage("newMessage")
  onMessage(@MessageBody() data: any) {
    console.log("Received Message:", data);
    this.server.emit("onMessage", {
      msg: "New Message",
      content: data,
    });
  }

  // ฟังก์ชันสำหรับส่งข้อมูลจาก server ไป client
  sendRealTimeData(data: any) {
    this.server.emit("realTimeData", data);
  }
  
  @SubscribeMessage('startTest')
  handleStartTest() {
    setInterval(() => {
      this.sendRealTimeData(`Test data at ${new Date().toLocaleTimeString()}`);
    }, 2000);
  }
}
import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io"
@WebSocketGateway({
})

export class Gateway implements OnModuleInit{

    @WebSocketServer()
    server: Server;

    onModuleInit(){
        this.server.on("connection", (socket:any) =>{
            console.log("NewClient: ",socket.id)
        })
    }

    @SubscribeMessage("newMessage")
    onMessage(@MessageBody() data: any) {
        console.log(data)
        this.server.emit("onMessage", {
            msg: "New Message",
            content: data
        })
    }
}
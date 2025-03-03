import { Module } from "@nestjs/common";
import { Gateway } from "./gateway";

@Module({
  providers: [Gateway],
  exports: [Gateway], // Export Gateway เพื่อให้โมดูลอื่นใช้ได้
})
export class GatewayModule {}
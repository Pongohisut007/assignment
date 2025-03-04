// src/gateway/gateway.module.ts
import { Module } from '@nestjs/common';
import { Gateway } from './gateway';
import { TypeormModule } from '../typeORM/typeorm.module'; // Import TypeormModule แทนการกำหนด ChatHistory แยก

@Module({
  imports: [TypeormModule], // ใช้ TypeormModule ที่มี UsersService และ ChatHistoryService
  providers: [Gateway],
  exports: [Gateway],
})
export class GatewayModule {}
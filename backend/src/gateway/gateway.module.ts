// src/gateway/gateway.module.ts
import { Module } from '@nestjs/common';
import { Gateway } from './gateway';
import { UsersModule } from 'src/typeORM/users/users.module';
import { ChatHistoryModule } from 'src/typeORM/chatHistory/chat-history.module';

@Module({
  imports: [UsersModule, ChatHistoryModule],
  providers: [Gateway],
  exports: [],
})
export class GatewayModule {}

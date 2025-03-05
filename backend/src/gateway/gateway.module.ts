import { Module, forwardRef } from '@nestjs/common';
import { Gateway } from './gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from 'src/typeORM/chat/chat.service';
import { UsersService } from 'src/typeORM/users/users.service';
import { Chat } from 'src/typeORM/chat/chat.entity';
import { Users } from 'src/typeORM/users/users.entity';
import { ChatModule } from 'src/typeORM/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Users])], // ใช้ forwardRef
  providers: [Gateway, ChatService],
  exports: [Gateway],
})
export class GatewayModule {}

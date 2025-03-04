// src/typeORM/typeorm.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Info } from './info/info.entity';
import { InfoController } from './info/info.controller';
import { InfoService } from './info/info.service';
import { Users } from './users/users.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { ChatHistory } from './chatHistory/chat-history.entity';
import { ChatHistoryController } from './chatHistory/chat-history.controller';
import { ChatHistoryService } from './chatHistory/chat-history.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '35.188.215.3',
      port: 3306,
      username: 'nongao',
      password: 'rootpass',
      database: 'world',
      entities: [Info, Users, ChatHistory],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Info, Users, ChatHistory]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [InfoController, UsersController, AuthController, ChatHistoryController],
  providers: [InfoService, UsersService, AuthService, JwtStrategy, ChatHistoryService],
  exports: [TypeOrmModule, UsersService, ChatHistoryService], // Export UsersService และ ChatHistoryService
})
export class TypeormModule {}
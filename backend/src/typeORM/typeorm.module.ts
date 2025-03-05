import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Users } from './users/users.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { ChatHistory } from './chatHistory/chat-history.entity';
import { ChatHistoryController } from './chatHistory/chat-history.controller';
import { ChatHistoryService } from './chatHistory/chat-history.service';
import { GatewayModule } from '../gateway/gateway.module';
import 'dotenv/config';
import { Post } from './post/entities/post.entity';
import { Comment } from './comment/entities/comment.entity';
import { Tag } from './tag/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Users, ChatHistory, Post, Comment, Tag],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Users, ChatHistory, Post, Comment, Tag]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
    forwardRef(() => GatewayModule), // ใช้ forwardRef
  ],
  controllers: [UsersController, AuthController, ChatHistoryController],
  providers: [UsersService, AuthService, JwtStrategy, ChatHistoryService],
  exports: [TypeOrmModule, UsersService, ChatHistoryService],
})
export class TypeormModule {}

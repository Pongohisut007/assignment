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
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { SubCommentModule } from './sub-comment/sub-comment.module';
import { SubComment } from './sub-comment/entities/sub-comment.entity';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { SubCommentService } from './sub-comment/sub-comment.service';
import { SubCommentController } from './sub-comment/sub-comment.controller';
import { ChatModule } from './chat/chat.module';
import { RoomModule } from './room/room.module';
import { Chat } from './chat/chat.entity';
import { Room } from './room/room.entity';
import { TagController } from './tag/tag.controller';
import { TagService } from './tag/tag.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        Users,
        ChatHistory,
        Post,
        Comment,
        Tag,
        SubComment,
        Chat,
        Room,
      ],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([
      Users,
      ChatHistory,
      Post,
      Comment,
      Tag,
      SubComment,
    ]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
    forwardRef(() => GatewayModule),
    //ChatModule,
    //RoomModule,
    //SubCommentModule, // ใช้ forwardRef
  ],
  controllers: [
    UsersController,
    AuthController,
    ChatHistoryController,
    PostController,
    CommentController,
    SubCommentController,
    TagController,
  ],
  providers: [
    UsersService,
    AuthService,
    JwtStrategy,
    ChatHistoryService,
    PostService,
    CommentService,
    SubCommentService,
    TagService,
  ],
  exports: [
    TypeOrmModule,
    UsersService,
    ChatHistoryService,
    PostService,
    CommentService,
    SubCommentService,
    TagService,
  ],
})
export class TypeormModule {}

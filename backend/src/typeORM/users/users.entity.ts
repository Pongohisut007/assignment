import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatHistory } from '../chatHistory/chat-history.entity';
import { Post } from '../post/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';
import { SubComment } from '../sub-comment/entities/sub-comment.entity';
import { Chat } from '../chat/chat.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GPT = 'gpt',
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column() // ซ่อน password เวลาดึงข้อมูล
  password_hash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.user)
  chatHistories: ChatHistory[];

  @OneToMany(() => Comment, (comment) => comment)
  comments: Comment[];

  @OneToMany(() => SubComment, (subcomment) => subcomment.owner)
  sub_comments: SubComment[];

  @OneToMany(() => Chat, (chat) => chat.owner)
  chats: Chat[];

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];
}

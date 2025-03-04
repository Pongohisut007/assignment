// src/typeORM/chat-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Users } from '../users/users.entity';


@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.chatHistories, { onDelete: 'CASCADE' })
  user: Users;

  @Column()
  prompt: string;

  @Column()
  response: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
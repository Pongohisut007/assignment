import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { Room } from '../room/room.entity';

@Entity() 
export class Chat {
  @PrimaryGeneratedColumn()
  chat_id: number;

  @ManyToOne(() => Users, (user) => user.chats)
  owner: Users;

  @ManyToOne(() => Room, (room) => room.chats)
  room: Room;

  @Column('longtext')
  message: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

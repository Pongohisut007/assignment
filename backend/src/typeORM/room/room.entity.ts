import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '../chat/chat.entity';

export enum RoomName {
  SPORT = 'sport',
  TECHNOLOGY = 'technology',
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column({ type: 'enum', enum: RoomName })
  room_name: RoomName;

  @OneToMany(() => Chat, (chat) => chat.room)
  chats: Chat[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

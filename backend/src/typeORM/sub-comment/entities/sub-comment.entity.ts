import { Comment } from 'src/typeORM/comment/entities/comment.entity';
import { Users } from 'src/typeORM/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SubComment {
  @PrimaryGeneratedColumn()
  sub_comment_id: number;

  @ManyToOne(() => Users, (user) => user.sub_comments)
  owner: Users;

  @Column('longtext')
  sub_comment: string;

  @ManyToOne(() => Comment, (comment) => comment.sub_comments)
  comment: Comment;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

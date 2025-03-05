import { Post } from 'src/typeORM/post/entities/post.entity';
import { SubComment } from 'src/typeORM/sub-comment/entities/sub-comment.entity';
import { Users } from 'src/typeORM/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @ManyToOne(() => Users, (user) => user.comments) 
  owner: Users;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column('longtext')
  comment: string;

  @OneToMany(() => SubComment, (subcomment) => subcomment.comment)
  sub_comments: SubComment[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

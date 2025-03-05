import { Comment } from 'src/typeORM/comment/entities/comment.entity';
import { Tag } from 'src/typeORM/tag/entities/tag.entity';
import { Users } from 'src/typeORM/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Column,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  post_id: number;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  @Column({ default: null })
  subject: string;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => Users, (user) => user.posts)
  owner: Users;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

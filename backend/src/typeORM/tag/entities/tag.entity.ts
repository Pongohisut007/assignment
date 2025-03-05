import { Post } from 'src/typeORM/post/entities/post.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id: number;

  @ManyToMany(() => Post)
  @JoinTable()
  posts: Post[];

  @Column()
  tag_name: string;
}

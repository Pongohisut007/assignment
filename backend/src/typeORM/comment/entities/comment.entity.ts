import { Post } from 'src/typeORM/post/entities/post.entity';
import { Users } from 'src/typeORM/users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @ManyToOne(() => Users, (user) => user.comments)
  owner: Users;
 
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  description: string;
}

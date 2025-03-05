import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/typeORM/post/entities/post.entity';
import { Comment } from 'src/typeORM/comment/entities/comment.entity';
import { ChatHistoryService } from 'src/typeORM/chatHistory/chat-history.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  async create(user: any, postData: any) {
    // 1. สร้างโพสต์ใหม่ในฐานข้อมูล
    const newPost: any = this.postRepository.create({
      subject: postData.subject,
      content: postData.content,
      owner: { user_id: postData.owner },
      ...(postData.tagIds && {
        tags: postData.tagIds.map((tag_id) => {
          return { tag_id: tag_id };
        }),
      }),
    });
    await this.postRepository.save(newPost);

    // 2. ใช้ GPT AI เพื่อสร้างคอมเมนต์แรก
    const aiResponse = await this.chatHistoryService.getChatGPTresponse(
      `SUBJECT:${postData.subject}\n` + `CONTENT:` + postData.content,
    );

    //3. บันทึกคอมเมนต์ AI ลงในฐานข้อมูล
    const aiComment = await this.commentRepository.create({
      post: { post_id: newPost.post_id },
      owner: { user_id: 3 },
      comment: aiResponse,
    });
    await this.commentRepository.save(aiComment);
    return { newPost, aiResponse };
  }

  async getAllPost() {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('comment.sub_comments', 'subComment')
      .leftJoinAndSelect('subComment.owner', 'subCommentAuthor')
      .leftJoinAndSelect('comment.owner', 'commentAuthor')
      .leftJoinAndSelect('post.owner', 'postAuthor')
      .getMany();
  }
}

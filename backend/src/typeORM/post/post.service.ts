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
 
  async create(user: any, createPostDto: any) {
    // 1. สร้างโพสต์ใหม่ในฐานข้อมูล
    const newPost = this.postRepository.create({
      content: createPostDto.information,
      owner: user,
    });
    await this.postRepository.save(newPost);

    // 2. ใช้ GPT AI เพื่อสร้างคอมเมนต์แรก
    const aiResponse = await this.chatHistoryService.getChatGPTresponse(
      user.user_id,
      createPostDto.information,
    );

    // 3. บันทึกคอมเมนต์ AI ลงในฐานข้อมูล
    // const aiComment = this.commentRepository.create({
    //   // post: { id: newPost.id },
    //   owner: { id: 1 },
    //   description: aiResponse,
    // });
    // await this.commentRepository.save(aiComment);
    return newPost;
  }
}

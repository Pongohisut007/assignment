import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubComment } from './entities/sub-comment.entity';
import { Repository } from 'typeorm';
// import { CreateSubCommentDto } from './dto/create-sub-comment.dtFo';
// import { UpdateSubCommentDto } from './dto/update-sub-comment.dto';

@Injectable()
export class SubCommentService {
  constructor(
    @InjectRepository(SubComment)
    private readonly subCommenttRepository: Repository<SubComment>,
  ) {}

  async create(subCommentData: any) {
    const newSubComment = this.subCommenttRepository.create({
      owner: { user_id: subCommentData.owner },
      comment: { comment_id: subCommentData.comment_id },
      sub_comment: subCommentData.sub_comment,
    });
    return await this.subCommenttRepository.save(newSubComment);
  }

  findAll() {
    return `This action returns all subComment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subComment`;
  }

  update(id: number, updateSubCommentDto: any) {
    return `This action updates a #${id} subComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} subComment`;
  }
}

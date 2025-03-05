import { Module } from '@nestjs/common';
import { SubCommentService } from './sub-comment.service';
import { SubCommentController } from './sub-comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubComment } from './entities/sub-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubComment])],
  controllers: [SubCommentController],
  providers: [SubCommentService],
})
export class SubCommentModule {}
 
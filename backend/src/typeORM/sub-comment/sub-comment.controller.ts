import {
  Controller,
  Get, 
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubCommentService } from './sub-comment.service';

@Controller('api/sub-comment')
export class SubCommentController {
  constructor(private readonly subCommentService: SubCommentService) {}

  @Post()
  async create(@Body() createSubCommentDto: any) {
    return this.subCommentService.create(createSubCommentDto);
  }
 
  @Get()
  findAll() {
    return this.subCommentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCommentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubCommentDto: any) {
    return this.subCommentService.update(+id, updateSubCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCommentService.remove(+id);
  }
}

import { Controller, Param, Get, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentService: CommentsService) {}

  @Get(':id')
  async getComment(@Param('id') id: string) {
    try {
      const result = await this.commentService.getComment(id);
      if (!result) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }
}

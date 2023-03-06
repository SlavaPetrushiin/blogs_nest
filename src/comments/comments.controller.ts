import { LikesService } from './../likes/likes.service';
import { StatusLike } from './../likes/schemas/likes.schema';
import { Body } from '@nestjs/common/decorators';
import { AccessTokenGuard } from './../auth/guards/accessToken.guard';
import {
  Controller,
  Param,
  Get,
  NotFoundException,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
  ForbiddenException,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentService: CommentsService,
    private likesService: LikesService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':commentId')
  async getComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.commentService.getComment(commentId, userId);

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() contentDto: { content: string },
    @Request() req,
    @Res() response: Response,
  ) {
    const result = await this.commentService.updateComment(
      id,
      contentDto.content,
      req.user.id,
    );

    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      throw new ForbiddenException();
    }
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(
    @Param('id') id: string,
    @Request() req,
    @Res() response: Response,
  ) {
    const result = await this.commentService.removeComment(id, req.user.id);

    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      throw new ForbiddenException();
    }
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  async updateLikeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('likeStatus', new ParseEnumPipe(StatusLike)) likeStatus: StatusLike,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.likesService.updateLikes({
      parentId: id,
      likeStatus,
      type: 'comment',
      userId,
    });
  }
}

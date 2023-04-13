import { BlogQueryRepositoryMongodb } from '../../blogs/infrastructure/blog-query.repository';
import { LikeStatusDto } from '../../likes/dto/like.dto';
import { GetUserIdFromBearerToken } from '../../guards/get-userId-from-bearer-token';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { AccessTokenGuard } from '../../auth/guards/accessToken.guard';
import { CommentsService } from '../../comments/comments.service';
import { AuthBasicGuard } from '../../auth/guards/auth_basic.guard';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  Query,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
  Request,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Body, Res, UseGuards } from '@nestjs/common/decorators';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsService } from '../application/posts.service';
import { SortDirectionType } from '../../types/types';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PostsQueryRepositoryMongodb } from '../infrastructure/posts-query.repository';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly blogQueryRepository: BlogQueryRepositoryMongodb,
    private readonly postsQueryRepository: PostsQueryRepositoryMongodb,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get()
  async getPosts(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
    @Request() req,
  ) {
    const { id } = req.user;
    return this.postsQueryRepository.findAllPosts(
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      id,
    );
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId')
  async getPost(@Param('postId') postId: string, @Request() req) {
    const { id } = req.user;
    const result = await this.postsService.getPost(postId, id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    const createdPost = await this.postsService.createPost(createPostDto);

    if (!createdPost) {
      throw new NotFoundException();
    }
    return createdPost;
  }

  // @UseGuards(AccessTokenGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   const result = await this.postsService.updatePost(updatePostDto, id);
  //   if (!result) {
  //     throw new NotFoundException();
  //   }
  //   return result;
  // }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePost(@Param('id') id: string) {
    const result = await this.postsService.removePost(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Post(':postId/comments')
  async createCommentsByPostId(@Param('postId') postId: string, @Body() contentDto: CreateCommentDto, @Request() req) {
    const { id } = req.user;
    const foundedPost = await this.postsService.getPost(postId, id);
    if (!foundedPost) throw new NotFoundException();

    const isBannedUserForBlog = await this.blogQueryRepository.findBannedBlogForUser(foundedPost.blogId, id);
    if (isBannedUserForBlog) throw new ForbiddenException();

    return this.commentsService.createComment({
      userId: id,
      postId,
      content: contentDto.content,
    });
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
    @Param('postId') postId: string,
    @Request() req,
  ) {
    const query = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    };
    const { id } = req.user;
    const comments = await this.postsService.getCommentsByPostId(query, postId, id);
    if (!comments) {
      throw new NotFoundException();
    }
    return comments;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':postId/like-status')
  async addLikeOrDislike(@Param('postId', ParseUUIDPipe) postId: string, @Body() { likeStatus }: LikeStatusDto, @Request() req, @Res() response: Response) {
    const { id, login } = req.user;
    const isCreated = await this.postsService.addLikeOrDislike(postId, likeStatus, id, login);

    if (!isCreated) {
      throw new NotFoundException();
    }

    return response.status(HttpStatus.NO_CONTENT).send();
  }
}

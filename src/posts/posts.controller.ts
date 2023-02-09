import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  Query,
  HttpException,
  HttpStatus,
  Res,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { SortDirectionType } from 'src/types/types';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getPosts(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
  ) {
    try {
      const result = await this.postsService.getPosts({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });
      return result;
    } catch (error) {}
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    try {
      const result = await this.postsService.getPost(id);
      if (!result) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    try {
      const createdPost = await this.postsService.createPost(createPostDto);

      if (!createdPost) {
        throw new NotFoundException();
      }
      return createdPost;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      const result = await this.postsService.updatePost(updatePostDto, id);
      if (!result) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePost(@Param('id') id: string) {
    try {
      const result = await this.postsService.removePost(id);
      if (!result) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

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
  ) {
    try {
      const query = {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      };
      const comments = await this.postsService.getCommentsByPostId(
        query,
        postId,
      );
      if (!comments) {
        throw new NotFoundException();
      }
      return comments;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }
}

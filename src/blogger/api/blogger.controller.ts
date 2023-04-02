import { CommentsQueryRepositoryMongodb } from './../../comments/infrastructure/comments-query.repository';
import { BlogQueryRepositoryMongodb } from './../../blogs/infrastructure/blog-query.repository';
import { PostsService } from '../../posts/posts.service';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUserIdFromBearerToken } from '../../guards/get-userId-from-bearer-token';
import { AccessTokenGuard } from '../../auth/guards/accessToken.guard';
import {
  Request,
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
  ForbiddenException,
} from '@nestjs/common';
import { Body, UseGuards } from '@nestjs/common/decorators';
import { CreateBlogDto } from '../../blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../blogs/dto/update-blog.dto';
import { BlogsService } from '../../blogs/application/blogs.service';
import { SortDirectionType } from '../../types/types';
import { CreatePostByBlogIdDto } from '../../posts/dto/create-post.dto';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryMongodb,
    private blogsService: BlogsService,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepositoryMongodb,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get('')
  async getBlogs(
    @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.blogQueryRepository.findAllBlogs(
      {
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      userId,
    );

    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Get('comments')
  async getAllCommentsBlogger(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.commentsQueryRepository.findAllCommentsForAllPosts(
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      userId,
    );
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const result = await this.blogQueryRepository.findBlog(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    const userId = req.user.id;
    const login = req.user.login;
    const createdBlog = await this.blogsService.createBlog(createBlogDto, userId, login);
    if (!createdBlog) {
      throw new NotFoundException();
    }
    return createdBlog;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() updateBlogDTO: UpdateBlogDto, @Request() req) {
    const userId = req.user.id;
    const updatedBlog = await this.blogsService.updateBlog(updateBlogDTO, id, userId);
    if (!updatedBlog) {
      throw new NotFoundException();
    }

    return updatedBlog;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBlog(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const result = await this.blogsService.removeBlog(id, userId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  /* Get posts by blogId */
  @UseGuards(GetUserIdFromBearerToken)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
    @Param('blogId') blogId: string,
    @Request() req,
  ) {
    const { id } = req.user;
    const query = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    };
    const foundBlog = await this.blogQueryRepository.findBlog(blogId);
    if (!foundBlog) throw new NotFoundException();

    const result = await this.blogsService.getPostsByBlogId(query, id, blogId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPostByBlogId(@Param('blogId') blogId: string, @Body() createPostDto: CreatePostByBlogIdDto, @Request() req) {
    const userId = req.user.id;
    const blog = await this.blogQueryRepository.findBlogWithOwnerInfo(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    const result = await this.blogsService.createPostByBlogId(createPostDto, blogId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    const userId = req.user.id;
    const blog = await this.blogQueryRepository.findBlogWithOwnerInfo(blogId);

    if (!blog) throw new NotFoundException();

    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
    const isUpdated = await this.postsService.updatePost(updatePostDto, postId);
    if (!isUpdated) {
      throw new NotFoundException();
    }
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string, @Request() req) {
    const userId = req.user.id;
    const blog = await this.blogQueryRepository.findBlogWithOwnerInfo(blogId);
    if (!blog) throw new NotFoundException();

    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
    const isDeleted = await this.postsService.removePost(postId);
    if (!isDeleted) {
      throw new NotFoundException();
    }
    return;
  }
}

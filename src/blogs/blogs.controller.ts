import { GetUserIdFromBearerToken } from './../guards/get-userId-from-bearer-token';
import { AccessTokenGuard } from './../auth/guards/accessToken.guard';
import { AuthBasicGuard } from '../auth/guards/auth_basic.guard';
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
} from '@nestjs/common';
import { Body, UseGuards } from '@nestjs/common/decorators';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';
import { SortDirectionType } from './../types/types';
import { CreatePostByBlogIdDto } from './../posts/dto/create-post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) { }

  @Get()
  async getBlogs(
    @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
  ) {
    try {
      const result = await this.blogsService.getBlogs({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });
      return result;
    } catch (error) { }
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const result = await this.blogsService.getBlog(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  // @UseGuards(AuthBasicGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const createdBlog = await this.blogsService.createBlog(createBlogDto);
    if (!createdBlog) {
      throw new NotFoundException();
    }
    return createdBlog;
  }

  //@UseGuards(AuthBasicGuard)
  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() updateBlogDTO: UpdateBlogDto) {
    const updatedBlog = await this.blogsService.updateBlog(updateBlogDTO, id);
    if (!updatedBlog) {
      throw new NotFoundException();
    }

    return updatedBlog;
  }

  //@UseGuards(AuthBasicGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBlog(@Param('id') id: string) {
    const result = await this.blogsService.removeBlog(id);
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
    const result = await this.blogsService.getPostsByBlogId(query, id, blogId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  //@UseGuards(AuthBasicGuard)
  @UseGuards(AccessTokenGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(@Param('blogId') blogId: string, @Body() createPostDto: CreatePostByBlogIdDto) {
    const result = await this.blogsService.createPostByBlogId(createPostDto, blogId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}

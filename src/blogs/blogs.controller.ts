import { IBlog } from './interfaces/blog.interface';
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
  Res,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';
import { Response } from 'express';
import { SortDirectionType } from 'src/types/types';
import {
  CreatePostByBlogIdDto,
  CreatePostDto,
} from 'src/posts/dto/create-post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

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
    } catch (error) {}
  }

  @Get(':id')
  async getBlog(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.blogsService.getBlog(id);
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).send();
      }
      return result;
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Res() res: Response) {
    try {
      const createdBlog = await this.blogsService.createBlog(createBlogDto);
      if (!createdBlog) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.send(createdBlog);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDTO: UpdateBlogDto,
  ) {
    return this.blogsService.updateBlog(updateBlogDTO, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBlog(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.blogsService.removeBlog(id);
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).send();
      }
      res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }

  /* Get posts by blogId */
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
  ) {
    try {
      const query = {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      };
      const result = await this.blogsService.getPostsByBlogId(query, blogId);
      if (!result) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostByBlogIdDto,
  ) {
    try {
      const result = await this.blogsService.createPostByBlogId(
        createPostDto,
        blogId,
      );
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

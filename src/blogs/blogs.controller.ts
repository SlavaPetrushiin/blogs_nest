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
  HttpException,
  HttpStatus,
  Res,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';
import { Types } from 'mongoose';
import { Response } from 'express';
import { SortDirectionType } from 'src/types/types';

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
      const result = await this.blogsService.getBlog(new Types.ObjectId(id));
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).send();
      }
      return result;
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Post()
  @HttpCode(201)
  async createPost(@Body() createBlogDto: CreateBlogDto, @Res() res: Response) {
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
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDTO: UpdateBlogDto,
  ) {
    return this.blogsService.updateBlog(updateBlogDTO, new Types.ObjectId(id));
  }

  @Delete(':id')
  @HttpCode(204)
  async removeBlog(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.blogsService.removeBlog(new Types.ObjectId(id));
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).send();
      }
      res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }
}

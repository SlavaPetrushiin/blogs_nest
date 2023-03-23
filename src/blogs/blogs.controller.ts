import { SkipThrottle } from '@nestjs/throttler';
import { GetUserIdFromBearerToken } from '../guards/get-userId-from-bearer-token';
import { Request, Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { BlogsService } from './blogs.service';
import { SortDirectionType } from '../types/types';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

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
  ) {
    const result = await this.blogsService.getBlogs({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });

    return result;
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const result = await this.blogsService.getBlog(id);
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
}

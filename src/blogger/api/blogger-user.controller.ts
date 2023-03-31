import { SortDirectionType } from './../../types/types';
import { UsersService } from './../../users/users.service';
import { BlogsService } from './../../blogs/application/blogs.service';
import { BlogQueryRepositoryMongodb } from './../../blogs/infrastructure/blog-query.repository';
import { BanBlogDto } from './../dto/ban-blog.dto';
import { AccessTokenGuard } from './../../auth/guards/accessToken.guard';
import {
  Controller,
  Param,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  NotFoundException,
  ForbiddenException,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('blogger/users')
export class BloggerUserController {
  constructor(private blogQueryRepository: BlogQueryRepositoryMongodb, private blogsService: BlogsService, private usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Put(':userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlogForUser(@Param('userId') userId: string, @Body() dto: BanBlogDto, @Request() req) {
    const bloggerId = req.user.id;
    const foundBlog = await this.blogQueryRepository.findBlogWithOwnerInfo(dto.blogId);
    const foundUser = await this.usersService.findUserById(userId);
    // console.log({ foundBlog, foundUser });
    if (!foundBlog) throw new NotFoundException();
    if (!foundUser) throw new NotFoundException();
    if (foundBlog.blogOwnerInfo.userId !== bloggerId) throw new ForbiddenException();

    const isUpdated = await this.blogsService.banOrUnbanBlogForUser(dto, userId, foundUser.login);
    if (!isUpdated) {
      throw new NotFoundException();
    }
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Get('/blog/:blogId')
  async getAllBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query('searchLoginTerm', new DefaultValuePipe('')) searchLoginTerm: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc)) sortDirection: SortDirectionType,
  ) {
    return this.blogQueryRepository.findAllBannedUsersForBlog(
      {
        searchLoginTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      blogId,
    );
  }
}

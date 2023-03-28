import { BlogQueryRepositoryMongodb } from './../blogs/infrastructure/blog-query.repository';
import { SkipThrottle } from '@nestjs/throttler';
import { BanUserDto } from './dto/ban-user.dto';
import { BlogsService } from '../blogs/application/blogs.service';
import { SortDirectionType } from './../types/types';
import { AuthBasicGuard } from '../auth/guards/auth_basic.guard';
import { AllEntitiesUser } from './dto/allEntitiesUser.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  HttpCode,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Put,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

@SkipThrottle()
@UseGuards(AuthBasicGuard)
@Controller('sa')
export class UsersController {
  constructor(protected usersService: UsersService, private readonly blogsService: BlogsService, private blogQueryRepository: BlogQueryRepositoryMongodb) {}

  @Get('blogs')
  async getBlogsBySA(
    @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
  ) {
    return this.blogQueryRepository.findAllBlogsBySA({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('blogs/:blogId/bind-with-user/:userId')
  async bindWithUser(@Param('blogId') blogId: string, @Param('userId') userId: string) {
    const isBind = await this.usersService.bindBlogWithUser(blogId, userId);
    if (!isBind) {
      throw new NotFoundException();
    }
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('blogs/:blogId/ban')
  async banBlog(@Param('blogId') blogId: string, @Body() banDto: { isBanned: boolean }) {
    const isBan = this.blogsService.banOrUnbanBlog(blogId, banDto.isBanned);

    if (!isBan) {
      throw new NotFoundException();
    }

    return;
  }

  @Get('users')
  async getUsers(@Query() allEntitiesUser: AllEntitiesUser) {
    const users = await this.usersService.getUsers(allEntitiesUser);
    if (!users) throw new BadRequestException();
    return users;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/users/:userId/ban')
  async addUserToBan(@Body() banUserDto: BanUserDto, @Param('userId') userId: string) {
    return this.usersService.banOrUnbanUse(banUserDto, userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('users/:uuid')
  async deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const isRemoved = await this.usersService.removeUser(uuid);
    if (!isRemoved) {
      throw new NotFoundException();
    }
  }
}

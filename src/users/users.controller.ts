import { BlogsService } from './../blogs/blogs.service';
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
  ParseIntPipe
} from '@nestjs/common';

@UseGuards(AuthBasicGuard)
@Controller('sa')
export class UsersController {
  constructor(protected usersService: UsersService, private readonly blogsService: BlogsService) { }

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
    return this.blogsService.findAllBlogsBySA({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })
  }

  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('blogs/:id/bind-with-user/:userId')
  async function(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    const isBind = await this.usersService.bindBlogWithUser(id, userId);
    if (!isBind) {
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

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put('/users/:id/ban')
  async addUserToBan() {
    return 'ban'
  }

  @Delete('users/:uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const isRemoved = await this.usersService.removeUser(uuid);
    if (!isRemoved) {
      throw new NotFoundException();
    }
  }
}

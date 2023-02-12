import { SortDirectionType } from './../types/types';
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
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(protected usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query('searchLoginTerm', new DefaultValuePipe('')) searchLoginTerm: string,
    @Query('searchEmailTerm', new DefaultValuePipe('')) searchEmailTerm: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe(SortDirectionType.desc))
    sortDirection: SortDirectionType,
  ) {
    try {
      const users = await this.usersService.getUsers({
        searchEmailTerm,
        searchLoginTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });
      if (!users) throw new BadRequestException();
      return users;
    } catch (error) {
      console.error(error);
      throw new BadRequestException();
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.usersService.createUser(createUserDto);
    if (!createdUser) {
      throw new BadRequestException();
    }
    return createdUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const isRemoved = await this.usersService.removeUser(id);
    if (!isRemoved) {
      throw new NotFoundException();
    }
  }
}

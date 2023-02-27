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
} from '@nestjs/common';

@UseGuards(AuthBasicGuard)
@Controller('users')
export class UsersController {
  constructor(protected usersService: UsersService) {}

  @Get()
  async getUsers(@Query() allEntitiesUser: AllEntitiesUser) {
    const users = await this.usersService.getUsers(allEntitiesUser);
    if (!users) throw new BadRequestException();
    return users;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const isRemoved = await this.usersService.removeUser(uuid);
    if (!isRemoved) {
      throw new NotFoundException();
    }
  }
}

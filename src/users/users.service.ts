import { CreateUserDto } from './dto/create-user.dto';
import { AllEntitiesUser } from './dto/allEntitiesUser';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUsers(query: AllEntitiesUser) {
    return this.usersRepository.findAllUsers(query);
  }

  async createUser(createUserDto: CreateUserDto) {
    const createdUser: UserDocument = await this.usersRepository.createUser(
      createUserDto,
    );
    await this.usersRepository.save(createdUser);

    return {
      id: createdUser.id,
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }

  async removeUser(id: string): Promise<boolean> {
    return this.usersRepository.removeUser(id);
  }
}

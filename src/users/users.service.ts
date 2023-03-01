import { Email } from './../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AllEntitiesUser } from './dto/allEntitiesUser.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';
import { PasswordService } from './schemas/Password';
import { v4 as uuidv4 } from 'uuid';
import { getArrayErrors } from './../utils/getArrayErrors';
import { add } from 'date-fns';

export type FindUserByEmailOrLogin = {
  email?: string;
  login?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: Email,
  ) {}

  async getUsers(query: AllEntitiesUser) {
    return this.usersRepository.findAllUsers(query);
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, login, password } = createUserDto;
    const code = uuidv4();

    const oldUser = await this.findUserByEmailOrLogin({
      email,
      login,
    });
    if (oldUser) {
      throw new BadRequestException(
        getArrayErrors('emailOrLogin', 'Пользователь уже существует'),
      );
    }

    const hashPassword = await PasswordService.hashPassword(password);
    const createdUser: UserDocument = await this.usersRepository.createUser({
      password: hashPassword,
      email,
      login,
      emailConfirmation: {
        code,
        expirationData: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed: false,
      },
    });

    await this.usersRepository.save(createdUser);

    const url = this.emailService.getMessageForSendingEmail(
      'confirm-email?code',
      code,
      'registration',
    );

    await this.emailService.sendEmail(email, url);

    return {
      id: createdUser.id,
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }

  async findUserByEmailOrLogin(
    payload: FindUserByEmailOrLogin,
  ): Promise<UserDocument> {
    return this.usersRepository.findUser(payload);
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.usersRepository.findUser({ email });
  }

  async findUserByLogin(login: string): Promise<UserDocument> {
    return this.usersRepository.findUser({ login });
  }

  async findUserByCode(code) {
    return this.usersRepository.findUserByCode(code);
  }

  async findUserById(userId: string) {
    return this.usersRepository.findUserById(userId);
  }

  async updateConfirmationStatus(userID: string) {
    return this.usersRepository.updateConfirmationStatus(userID);
  }

  async updateConfirmationCode(id: string, code: string, expirationData: Date) {
    return this.usersRepository.updateConfirmationCode(
      id,
      code,
      expirationData,
    );
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    return this.usersRepository.updatePassword(id, newPassword);
  }

  async removeUser(id: string): Promise<boolean> {
    return this.usersRepository.removeUser(id);
  }
}

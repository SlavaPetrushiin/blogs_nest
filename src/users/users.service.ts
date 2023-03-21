import { AuthRepository } from './../auth/auth.repository';
import { BanUserDto } from './dto/ban-user.dto';
import { BlogDocument } from './../blogs/schemas/blog.schema';
import { BlogsRepository } from './../blogs/blogs.repository';
import { Email } from './../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AllEntitiesUser } from './dto/allEntitiesUser.dto';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument, IBanInfo } from './schemas/user.schema';
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
    private readonly blogsRepository: BlogsRepository,
    private readonly authRepository: AuthRepository
  ) { }

  async getUsers(query: AllEntitiesUser) {
    return this.usersRepository.findAllUsers(query);
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, login, password } = createUserDto;
    const code = uuidv4();

    const oldUserByEmail = await this.findUserByEmail(email);
    const oldUserByLogin = await this.findUserByLogin(login);
    if (oldUserByEmail) {
      throw new BadRequestException(
        getArrayErrors('email', 'Пользователь уже существует'),
      );
    }

    if (oldUserByLogin) {
      throw new BadRequestException(
        getArrayErrors('login', 'Пользователь уже существует'),
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
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null
      }
    });

    await this.usersRepository.save(createdUser);

    const url = this.emailService.getMessageForSendingEmail(
      'confirm-email?code',
      code,
      'registration',
    );

    // this.emailService.sendEmail(email, url); TO DO DEL COMMIT
    return {
      id: createdUser.id,
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      banInfo: createdUser.banInfo
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

  async banOrUnbanUse(banUserDto: BanUserDto, userId: string): Promise<boolean> {
    let foundedUser = await this.usersRepository.findUserById(userId);

    if (!foundedUser) {
      throw new NotFoundException();
    }

    const updateBanInfo: IBanInfo = banUserDto.isBanned
      ? {
        isBanned: banUserDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: banUserDto.banReason,
      }
      : { isBanned: banUserDto.isBanned, banDate: null, banReason: null };

    await this.usersRepository.banOrUnbanUser(updateBanInfo, userId);
    await this.authRepository.removeSessionBanedUser(userId);

    return true;
  }

  async bindBlogWithUser(blogsId: string, userId: string): Promise<boolean> {
    const foundedBlog = await this.blogsRepository.findBlog(blogsId);
    const foundedUser = await this.usersRepository.findUserById(userId);
    const errors = this.validateDataForBindBlog(foundedBlog, foundedUser);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.blogsRepository.bindBlogWithUser(blogsId, userId, foundedUser.login)
  }

  validateDataForBindBlog(foundedBlog: BlogDocument, foundedUser: UserDocument): { field: string, message: string }[] {
    const errors = [];

    if (!foundedBlog) errors.push({ field: "blog", message: "Blog not exsist" });
    if (foundedBlog.blogOwnerInfo.ownerId) errors.push({ field: "blog", message: "Blog with bind user" });
    if (!foundedUser) errors.push({ field: "blog", message: "User not exist" });

    return errors;
  }
}

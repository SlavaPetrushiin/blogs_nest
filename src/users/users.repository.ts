import { PasswordService } from './schemas/Password';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AllEntitiesUser } from './dto/allEntitiesUser';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findAllUsers(query: AllEntitiesUser) {
    const {
      pageNumber,
      pageSize,
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
    } = query;

    const skip = (+pageNumber - 1) * +pageSize;

    const result = await this.UserModel.find(
      {
        $or: [
          { email: { $regex: searchEmailTerm, $options: '$i' } },
          { login: { $regex: searchLoginTerm, $options: '$i' } },
        ],
      },
      { projection: { ...DEFAULT_PROJECTION } },
    )
      .skip(skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.UserModel.countDocuments({
      $or: [
        { email: { $regex: searchEmailTerm, $options: '$i' } },
        { login: { $regex: searchLoginTerm, $options: '$i' } },
      ],
    });
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: result.map((user) => ({
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      })),
    };
  }

  async createUser(user: CreateUserDto): Promise<UserDocument> {
    const hashPassword = await PasswordService.hashPassword(user.password);
    const emailConfirmation = {
      code: uuidv4(),
      expirationData: new Date(),
      isConfirmed: false,
    };

    return new this.UserModel({
      password: hashPassword,
      login: user.login,
      email: user.email,
      emailConfirmation: { ...emailConfirmation },
    });
  }

  async save(user: UserDocument) {
    return user.save();
  }

  async removeUser(id: string): Promise<boolean> {
    console.log(id);
    const res = await this.UserModel.deleteOne({ id });
    return res.deletedCount > 0 ? true : false;
  }
}

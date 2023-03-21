import { FindUserByEmailOrLogin } from './users.service';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AllEntitiesUser } from './dto/allEntitiesUser.dto';
import { User, UserDocument, IBanInfo } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) { }

  async findAllUsers(query: AllEntitiesUser) {
    const { pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortBy, sortDirection } = query;

    const skip = (+pageNumber - 1) * +pageSize;
    const result = await this.UserModel.find(
      {
        $or: [{ email: { $regex: searchEmailTerm, $options: 'i' } }, { login: { $regex: searchLoginTerm, $options: 'i' } }],
      },
      { projection: { ...DEFAULT_PROJECTION } },
    )
      .skip(skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.UserModel.countDocuments({
      $or: [{ email: { $regex: searchEmailTerm, $options: 'i' } }, { login: { $regex: searchLoginTerm, $options: 'i' } }],
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

  async createUser(user): Promise<UserDocument> {
    return new this.UserModel(user);
  }

  async findUser(payload: FindUserByEmailOrLogin): Promise<UserDocument> {
    return this.UserModel.findOne({
      $or: [{ email: payload.email }, { login: payload.login }],
    }).exec();
  }

  async findUserByCode(code): Promise<UserDocument> {
    return this.UserModel.findOne({ 'emailConfirmation.code': code }, { projection: { ...DEFAULT_PROJECTION } }).exec();
  }

  async findUserById(userId: string) {
    return this.UserModel.findOne({ id: userId }).exec();
  }

  async updateConfirmationStatus(userId: string) {
    return this.UserModel.findOneAndUpdate({ id: userId }, { $set: { 'emailConfirmation.isConfirmed': true } });
  }

  async updateConfirmationCode(id: string, code: string, expirationData: Date) {
    return this.UserModel.findOneAndUpdate(
      { id },
      {
        $set: {
          'emailConfirmation.code': code,
          'emailConfirmation.expirationData': expirationData,
        },
      },
    );
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const result = await this.UserModel.updateOne({ id }, { $set: { password: newPassword } });

    return result.matchedCount > 0;
  }

  async save(user: UserDocument) {
    return user.save();
  }

  async removeUser(id: string): Promise<boolean> {
    const res = await this.UserModel.deleteOne({ id });
    return res.deletedCount > 0 ? true : false;
  }

  async deleteMany() {
    return this.UserModel.deleteMany({});
  }

  async banOrUnbanUser(updateBanInfo: IBanInfo, userId: string) {
    return this.UserModel.updateOne(
      { id: userId },
      { $set: { banInfo: updateBanInfo } },
    ).exec();
  }
}

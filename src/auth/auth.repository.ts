import { AuthDocument, Auth } from './schemas/auth.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

export interface IPramsForUpdateRefreshToken {
  oldLastActiveDate: string;
  lastActiveDate: string;
  exp: string;
}

export interface IUserDataSession {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(Auth.name) private AuthModel: Model<AuthDocument>) { }

  async createSession(dataSession) {
    return new this.AuthModel(dataSession);
  }

  async getSession(iat: string, userId: string, deviceId: string): Promise<AuthDocument> {
    return this.AuthModel.findOne({ lastActiveDate: iat, userId, deviceId }, { projection: { ...DEFAULT_PROJECTION } }).exec();
  }

  async findAllSessions(userId: string): Promise<IUserDataSession[]> {
    const result = await this.AuthModel.find({ userId }, { projection: { ...DEFAULT_PROJECTION, exp: false, userId: false } }).exec();
    return result.map(item => ({ ip: item.ip, title: item.title, lastActiveDate: item.lastActiveDate, deviceId: item.deviceId }))
  }

  public async removeSession(userId: string, deviceId: string): Promise<boolean> {
    const res = await this.AuthModel.deleteOne({ userId, deviceId });
    return res.deletedCount > 0;
  }

  async removeAllSessionsUserNotCurrent(userId: string, deviceId: string): Promise<boolean> {
    const res = await this.AuthModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
    return res.deletedCount > 0;
  }

  async updateSession(params: IPramsForUpdateRefreshToken): Promise<boolean> {
    const res = await this.AuthModel.updateOne(
      { lastActiveDate: params.oldLastActiveDate },
      { $set: { lastActiveDate: params.lastActiveDate, exp: params.exp } },
    );

    if (res.modifiedCount == 0) {
      return false;
    }
    return true;
  }

  public async getDevice(deviceId: string): Promise<AuthDocument> {
    return await this.AuthModel.findOne({ deviceId }).exec();
  }

  async save(dataSession: AuthDocument) {
    return dataSession.save();
  }

  async deleteMany() {
    return this.AuthModel.deleteMany({});
  }

  async logout(userId: string, deviceId: string, lastActiveDate: string): Promise<boolean> {
    const isDeleted = await this.AuthModel.deleteOne({ lastActiveDate, userId, deviceId });
    return isDeleted.deletedCount > 0;
  }
}

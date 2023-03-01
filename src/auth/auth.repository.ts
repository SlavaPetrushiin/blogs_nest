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

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(Auth.name) private AuthModel: Model<AuthDocument>) {}

  async createSession(dataSession) {
    return new this.AuthModel(dataSession);
  }

  async getSession(
    iat: string,
    userId: string,
    deviceId: string,
  ): Promise<AuthDocument> {
    return this.AuthModel.findOne(
      { lastActiveDate: iat, userId, deviceId },
      { projection: { ...DEFAULT_PROJECTION } },
    ).exec();
  }

  async findAllSessions(userId: string): Promise<AuthDocument[]> {
    return this.AuthModel.find(
      { userId },
      { projection: { ...DEFAULT_PROJECTION, exp: false, userId: false } },
    );
  }

  public async removeSession(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const res = await this.AuthModel.deleteOne({ userId, deviceId });
    return res.deletedCount > 0 ? true : false;
  }

  async removeAllSessionsUserNotCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const res = await this.AuthModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
    return res.deletedCount > 0 ? true : false;
  }

  async updateSession(params: IPramsForUpdateRefreshToken) {
    const res = await this.AuthModel.updateOne(
      { lastActiveDate: params.oldLastActiveDate },
      { $set: { lastActiveDate: params.lastActiveDate, exp: params.exp } },
    );
    if (res.matchedCount == 0) {
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
}

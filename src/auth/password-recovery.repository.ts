import {
  PasswordRecovery,
  PasswordRecoveryDocument,
} from './schemas/password-recovery.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: Model<PasswordRecoveryDocument>,
  ) {}

  public async createOrUpdatePasswordRecovery(
    recoveryCode: string,
    email: string,
    dateExpired: Date,
  ): Promise<boolean> {
    const query = { email };
    const update = { $set: { recoveryCode, dateExpired } };
    const options = { upsert: true };
    const result = await this.passwordRecoveryModel.updateOne(
      query,
      update,
      options,
    );
    return result.acknowledged;
  }

  public async getRecoveryPassword(
    recoveryCode: string,
  ): Promise<PasswordRecoveryDocument> {
    return this.passwordRecoveryModel.findOne({ recoveryCode });
  }
}

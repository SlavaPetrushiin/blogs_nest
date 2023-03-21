import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

Schema();
class EmailConfirmation {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  expirationData: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);


export interface IBanInfo {
  isBanned: boolean;
  banDate: string;
  banReason: string;
}
@Schema({ _id: false, id: false, versionKey: false })
export class BanInfo implements IBanInfo {
  @Prop({ required: true, type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: String, default: '' })
  banDate: string;

  @Prop({ type: String, default: '' })
  banReason: string;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      delete ret._id;
      delete ret.updatedAt;
      return ret;
    },
  },
})
export class User {
  createdAt: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    type: {
      code: String,
      expirationData: Date,
      isConfirmed: Boolean,
    },
  })
  emailConfirmation: {
    code: string;
    expirationData: Date;
    isConfirmed: boolean;
  };

  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);

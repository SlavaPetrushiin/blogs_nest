import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

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
export class PasswordRecovery {
  createdAt: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  id: string;

  @Prop({ required: true })
  recoveryCode: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  dateExpired: Date;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type LikesDocument = HydratedDocument<Likes>;

export enum StatusLike {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

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
export class Likes {
  createdAt: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  id: string;

  @Prop({ required: true })
  parentId: string;

  @Prop({ required: true })
  status: StatusLike;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: 'post' | 'comment';

  @Prop({ required: true })
  addedAt: string;
}

export const LikesSchema = SchemaFactory.createForClass(Likes);

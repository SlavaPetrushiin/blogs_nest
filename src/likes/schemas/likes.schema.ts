import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// export type LikesDocument = Likes & Document;

export enum StatusLike {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type TypeParendId = 'post' | 'comment';

export type ILikes = ILikesInfo;
export interface ILikeModel extends Model<ILikes> {
  getLikesInfo(
    parentId: string,
    userId: string,
    type: TypeParendId,
  ): Promise<ILikesInfo>;
}

export interface ILikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: StatusLike;
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
export class Likes extends Document {
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
  type: TypeParendId;

  @Prop({ required: true })
  addedAt: string;

  getLikesInfo: (
    parentId: string,
    userId: string,
    type: TypeParendId,
  ) => Promise<ILikesInfo>;
}

export interface ILikesStatics {
  getLikesInfo: (
    parentId: string,
    userId: string,
    type: TypeParendId,
  ) => Promise<ILikesInfo>;
}
export type LikesDocument = Likes & Document;
export const LikesSchema = SchemaFactory.createForClass(Likes);

LikesSchema.statics.getLikesInfo = async function (
  parentId: string,
  userId: string,
  type: TypeParendId,
): Promise<ILikesInfo> {
  const likesAndDislikes = await this.find({
    parentId,
    type,
  }).exec();

  const likesInfo = {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: StatusLike.None,
  };

  likesAndDislikes.forEach((item) => {
    if (item.status === StatusLike.Like) {
      likesInfo.likesCount = ++likesInfo.likesCount;
    }

    if (item.status === StatusLike.Dislike) {
      likesInfo.dislikesCount = ++likesInfo.dislikesCount;
    }

    if (item.userId === userId) {
      likesInfo.myStatus = item.status;
    }
  });

  return likesInfo;
};

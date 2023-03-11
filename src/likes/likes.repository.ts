import { CreateOrUpdateLikeDto } from './likes.service';
import {
  LikesDocument,
  Likes,
  StatusLike,
  ILikesInfo,
} from './schemas/likes.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Likes.name) private LikesModel: Model<LikesDocument>,
  ) {}

  async updateLike(params: CreateOrUpdateLikeDto) {
    const { likeStatus, parentId, type, userId } = params;
    const query = { parentId, userId, type };
    const update = { $set: { status: likeStatus } };
    const options = { upsert: true };
    const result = await this.LikesModel.updateOne(query, update, options);
    return result;
  }

  // async getLikesInfo(parentId: string, userId: string, type: 'comment' | 'post'): Promise<ILikesInfo> {
  //   const likesAndDislikes: LikesDocument[] = await this.LikesModel.find({
  //     parentId,
  //     type,
  //   }).exec();

  //   const likesInfo = {
  //     likesCount: 0,
  //     dislikesCount: 0,
  //     myStatus: StatusLike.None,
  //   };

  //   likesAndDislikes.forEach((item) => {
  //     if (item.status === StatusLike.Like) {
  //       likesInfo.likesCount = ++likesInfo.likesCount;
  //     }

  //     if (item.status === StatusLike.Dislike) {
  //       likesInfo.dislikesCount = ++likesInfo.dislikesCount;
  //     }

  //     if (item.userId === userId) {
  //       likesInfo.myStatus = item.status;
  //     }
  //   });

  //   return likesInfo;
  // }
}

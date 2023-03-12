import { CreateOrUpdateLikeDto } from './likes.service';
import { LikesDocument, Likes, StatusLike, ILikesInfo, TypeParentId } from './schemas/likes.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Likes.name) private LikesModel: Model<LikesDocument>) {}

  async updateLike(params: CreateOrUpdateLikeDto) {
    const { likeStatus, parentId, type, userId } = params;
    const query = { parentId, userId, type };
    const update = { $set: { status: likeStatus } };
    const options = { upsert: true };
    const result = await this.LikesModel.updateOne(query, update, options);
    return result;
  }

  async findLikesDislikesByParentsId(parentId: string[], type: TypeParentId): Promise<LikesDocument[]> {
    return this.LikesModel.find({
      parentId: { $in: [...parentId] },
      type,
    }).exec();
  }
}

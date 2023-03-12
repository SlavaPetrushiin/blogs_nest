import { CreateOrUpdateLikeDto } from './likes.service';
import { LikesDocument, Likes, TypeParentId } from './schemas/likes.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Likes.name) private LikesModel: Model<LikesDocument>) {}

  async updateLike(params: CreateOrUpdateLikeDto) {
    const { likeStatus, parentId, type, userId, login } = params;
    const query = { parentId, userId, type, login };
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

  async deleteMany() {
    return this.LikesModel.deleteMany({});
  }
}

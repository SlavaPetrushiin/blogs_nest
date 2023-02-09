import { AllEntitiesComment } from './dto/allEntitiesComment';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Injectable } from '@nestjs/common';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async findPost(commentID: string) {
    return this.CommentModel.findOne(
      { id: commentID },
      DEFAULT_PROJECTION,
    ).exec();
  }

  async getCommentsByPostId(query: AllEntitiesComment, postId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;

    const result = await this.CommentModel.find(
      { postId },
      { projection: { ...DEFAULT_PROJECTION, postId: false } },
    )
      .skip(skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.CommentModel.countDocuments({ postId });
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: result,
    };
  }

  async deleteMany() {
    return this.CommentModel.deleteMany({});
  }
}

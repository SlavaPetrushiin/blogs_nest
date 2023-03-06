import {
  Likes,
  LikesDocument,
  StatusLike,
} from './../likes/schemas/likes.schema';
import { AllEntitiesComment } from './dto/allEntitiesComment';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IParamsCreateComment } from './comments.service';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(Likes.name) private LikesModel: Model<LikesDocument>,
  ) {}

  async findComment(commentID: string, userId: string) {
    const comment = await this.CommentModel.findOne(
      { id: commentID },
      DEFAULT_PROJECTION,
    ).exec();

    if (!comment) {
      throw new NotFoundException();
    }

    const likesInfo = await this.getLikesInfo(commentID, userId);

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo,
    };
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

  async createComment(params: IParamsCreateComment): Promise<CommentDocument> {
    return new this.CommentModel({ ...params });
  }

  async updateComment(commentId: string, newContent: string): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { id: commentId },
      { $set: { content: newContent } },
    );
    console.log(result);
    return result.matchedCount > 0;
  }

  async removeComment(commentId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({ id: commentId });
    return result.deletedCount > 0;
  }

  async deleteMany() {
    return this.CommentModel.deleteMany({});
  }

  async save(comment: CommentDocument) {
    return comment.save();
  }

  async getLikesInfo(commentID: string, userId: string) {
    const likesAndDislikes: LikesDocument[] = await this.LikesModel.find({
      parentId: commentID,
      type: 'comment',
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
  }
}

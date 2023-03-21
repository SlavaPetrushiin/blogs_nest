import { LikesDocument, StatusLike, ILikesInfo } from './../likes/schemas/likes.schema';
import { LikesRepository } from './../likes/likes.repository';
import { AllEntitiesComment } from './dto/allEntitiesComment';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IParamsCreateComment } from './comments.service';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentDocument>, private readonly likesRepository: LikesRepository) { }

  async findComment(commentID: string, userId: string) {
    const comment = await this.CommentModel.findOne({ id: commentID, isBanned: false }, DEFAULT_PROJECTION).exec();

    if (!comment) {
      throw new NotFoundException();
    }

    const likesAndDislikes = await this.likesRepository.findLikesDislikesByParentsId([comment.id], 'comment');
    const likesInfo = this.getLikesInfo(likesAndDislikes, userId, comment.id);

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

  async getCommentsByPostId(query: AllEntitiesComment, postId: string, userId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;

    const comments: CommentDocument[] = await this.CommentModel.find({ postId, isBanned: false }, { projection: { ...DEFAULT_PROJECTION, postId: false } })
      .skip(skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.CommentModel.countDocuments({ postId });
    const pageCount = Math.ceil(totalCount / +pageSize);
    const idComments: string[] = comments.map((com) => com.id);

    const likesAndDislikes = await this.likesRepository.findLikesDislikesByParentsId(idComments, 'comment');
    const preparedResult = [];

    for (const comment of comments) {
      const likesInfo = this.getLikesInfo(likesAndDislikes, userId, comment.id);

      preparedResult.push({
        content: comment.content,
        id: comment.id,
        createdAt: comment.createdAt,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        likesInfo,
      });
    }

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: preparedResult,
    };
  }

  async updateUserBanStatus(userId: string, isBanned: boolean) {
    return this.CommentModel.updateOne(
      { userId },
      {
        $set: { isBanned },
      },
    )
  }

  private getLikesInfo(dataArray: LikesDocument[], userId: string, parentId: string): ILikesInfo {
    const likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: StatusLike.None,
    };

    for (const likeOrDislike of dataArray) {
      if (parentId !== likeOrDislike.parentId) {
        continue;
      }

      if (likeOrDislike.status === StatusLike.Like) {
        likesInfo.likesCount = ++likesInfo.likesCount;
      }

      if (likeOrDislike.status === StatusLike.Dislike) {
        likesInfo.dislikesCount = ++likesInfo.dislikesCount;
      }

      if (likeOrDislike.userId === userId) {
        likesInfo.myStatus = likeOrDislike.status;
      }
    }

    return likesInfo;
  }

  async createComment(params: IParamsCreateComment): Promise<CommentDocument> {
    return new this.CommentModel({ ...params });
  }

  async updateComment(commentId: string, newContent: string): Promise<boolean> {
    const result = await this.CommentModel.updateOne({ id: commentId }, { $set: { content: newContent } });
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
}

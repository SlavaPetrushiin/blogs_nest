import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { AllEntitiesComment } from '../dto/allEntitiesComment';

@Injectable()
export class CommentsQueryRepositoryMongodb {
  constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentDocument>) {}

  async findAllCommentsForAllPosts(query: AllEntitiesComment, userId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;
    const typeSortDirection = sortDirection === 'asc' ? 1 : -1;

    const comments = await this.CommentModel.aggregate([
      //{ $match: { userId } },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: 'id',
          as: 'posts',
        },
      },
      { $unwind: '$posts' },
      { $sort: { [sortBy]: typeSortDirection } },
      { $skip: skip },
      { $limit: +pageSize },
      {
        $lookup: {
          from: 'likes',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Like',
                isBanned: false,
              },
            },
          ],
          as: 'likesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Dislike',
                isBanned: false,
              },
            },
          ],
          as: 'dislikesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                userId: userId ?? '',
              },
            },
          ],
          as: 'myStatus',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          content: 1,
          createdAt: 1,
          commentatorInfo: {
            userId: '$userId',
            userLogin: '$userLogin',
          },
          postInfo: {
            id: '$posts.id',
            title: '$posts.title',
            blogId: '$posts.blogId',
            blogName: '$posts.blogName',
          },
          'likesInfo.likesCount': { $size: '$likesCount' },
          'likesInfo.dislikesCount': { $size: '$dislikesCount' },
          'likesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.status',
            },
          },
        },
      },
      { $unwind: '$likesInfo.likesCount' },
      { $unwind: '$likesInfo.dislikesCount' },
      { $unwind: '$likesInfo.myStatus' },
    ]);

    const totalCount = await this.CommentModel.countDocuments();
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: comments,
    };
  }
}

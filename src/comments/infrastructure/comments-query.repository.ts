import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { AllEntitiesComment } from '../dto/allEntitiesComment';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class CommentsQueryRepositoryMongodb {
  constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentDocument>) {}

  async findAllCommentsForAllPosts(query: AllEntitiesComment, userId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;

    const comments: CommentDocument[] = await this.CommentModel.find({ userId }, { projection: { ...DEFAULT_PROJECTION, postId: false } })
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(+pageSize);
  }

  async findAllCommentsForAllPosts_2(query: AllEntitiesComment, userId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;
    const typeSortDirection = sortDirection === 'asc' ? 1 : -1;

    return this.CommentModel.aggregate([
      { $match: { userId } },
      { $sort: { [sortBy]: typeSortDirection } },
      { $skip: skip },
      { $limit: +pageSize },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: 'id',
          as: 'posts',
        },
      },
      { $unwind: '$posts' },
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
        },
      },
    ]);
  }
}

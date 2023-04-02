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

import { BlogQueryRepositoryMongodb } from '../../blogs/infrastructure/blog-query.repository';
import { LikesRepository } from '../../likes/likes.repository';
import { StatusLike, LikesDocument, ILikesInfo } from '../../likes/schemas/likes.schema';
import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../models/schemas/post.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { AllEntitiesPost } from '../dto/AllEntitiesPost';

const DEFAULT_PROJECTION = { _id: 0, __v: 0, updatedAt: 0 };

@Injectable()
export class PostsQueryRepositoryMongodb {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private likesRepository: LikesRepository,
    private blogQueryRepository: BlogQueryRepositoryMongodb,
  ) {}

  // async findAllPosts(params: AllEntitiesPost, userId: string, blogId: string = null) {
  //   const { pageNumber, pageSize, sortBy, sortDirection } = params;
  //   const skip = (+pageNumber - 1) * +pageSize;
  //   const bannedBlogs = (await this.blogQueryRepository.findAllBannedBlogsIDs()).map((blog) => blog.id);
  //   const postFilter: any = { isBanned: false, blogId: { $nin: bannedBlogs } };

  //   if (blogId) {
  //     postFilter.blogId = blogId;
  //   }

  //   const result = await this.PostModel.find(postFilter, DEFAULT_PROJECTION)
  //     .skip(+skip)
  //     .limit(+pageSize)
  //     .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 })
  //     .lean();

  //   const totalCount = await this.PostModel.countDocuments(postFilter, {});
  //   const pageCount = Math.ceil(totalCount / +pageSize);
  //   const idPosts: string[] = result.map((com) => com.id);
  //   const likesAndDislikes = await this.likesRepository.findLikesDislikesByParentsId(idPosts, 'post');
  //   const preparedResult = [];

  //   for (const post of result) {
  //     const likesInfo = this.getLikesInfo(likesAndDislikes, userId, post.id);
  //     const onlyLikes = likesAndDislikes.filter((item) => item.status === StatusLike.Like);
  //     const lastThreeLikes = JSON.parse(JSON.stringify(onlyLikes)).filter((l) => l.parentId === post.id);
  //     lastThreeLikes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  //     if (lastThreeLikes.length > 3) {
  //       lastThreeLikes.length = 3;
  //     }

  //     preparedResult.push({
  //       id: post.id,
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: post.blogId,
  //       blogName: post.blogName,
  //       createdAt: post.createdAt,
  //       extendedLikesInfo: {
  //         dislikesCount: likesInfo.dislikesCount,
  //         likesCount: likesInfo.likesCount,
  //         myStatus: likesInfo.myStatus,
  //         newestLikes: lastThreeLikes.map((like) => ({
  //           addedAt: like.createdAt,
  //           userId: like.userId,
  //           login: like.login,
  //         })),
  //       },
  //     });
  //   }
  //   return {
  //     pagesCount: pageCount,
  //     page: +pageNumber,
  //     pageSize: +pageSize,
  //     totalCount: totalCount,
  //     items: preparedResult,
  //   };
  // }

  async findAllPosts(query: AllEntitiesPost, userId: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;
    const typeSortDirection = sortDirection === 'asc' ? 1 : -1;

    const posts = this.PostModel.aggregate([
      { $match: { userId: userId ?? '' } },
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
            { $sort: { addedAt: -1 } },
            { $limit: 3 },
            {
              $project: { _id: 0, createdAt: 1, userId: 1, login: 1 },
            },
          ],
          as: 'newestLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          shortDescription: 1,
          content: 1,
          blogId: 1,
          blogName: 1,
          createdAt: 1,
          'extendedLikesInfo.likesCount': { $size: '$likesCount' },
          'extendedLikesInfo.dislikesCount': { $size: '$dislikesCount' },
          'extendedLikesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.status',
            },
          },
          'extendedLikesInfo.newestLikes': '$newestLikes',
        },
      },

      { $unwind: '$extendedLikesInfo.likesCount' },
      { $unwind: '$extendedLikesInfo.dislikesCount' },
      { $unwind: '$extendedLikesInfo.myStatus' },
    ]);

    const totalCount = await this.PostModel.countDocuments();
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: posts,
    };
  }

  async findPost(id: string): Promise<PostDocument> {
    const bannedBlogs = (await this.blogQueryRepository.findAllBannedBlogsIDs()).map((blog) => blog.id);
    return this.PostModel.findOne({ id: id, isBanned: false, blogId: { $nin: bannedBlogs } }, DEFAULT_PROJECTION).exec();
  }

  public getLikesInfo(dataArray: LikesDocument[], userId: string, parentId: string): ILikesInfo {
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
}

import { LikesRepository } from './../likes/likes.repository';
import { StatusLike, LikesDocument, ILikesInfo } from './../likes/schemas/likes.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { AllEntitiesPost } from './dto/AllEntitiesPost';
import { UpdatePostDto } from './dto/update-post.dto';

const DEFAULT_PROJECTION = { _id: 0, __v: 0, updatedAt: 0 };

interface INewPostDto extends CreatePostDto {
  blogName: string;
  blogId: string;
  userId: string
}

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>, private likesRepository: LikesRepository) { }

  async findAllPosts(params: AllEntitiesPost, userId: string, blogId: string = null) {
    const { pageNumber, pageSize, sortBy, sortDirection } = params;
    const skip = (+pageNumber - 1) * +pageSize;
    const postFilter: any = { isBanned: false };

    if (blogId) {
      postFilter.blogId = blogId;
    }

    const result = await this.PostModel.find(postFilter, DEFAULT_PROJECTION)
      .skip(+skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 })
      .lean();

    const totalCount = await this.PostModel.countDocuments(postFilter, {});
    const pageCount = Math.ceil(totalCount / +pageSize);
    const idPosts: string[] = result.map((com) => com.id);
    const likesAndDislikes = await this.likesRepository.findLikesDislikesByParentsId(idPosts, 'post');
    const preparedResult = [];

    for (const post of result) {
      const likesInfo = this.getLikesInfo(likesAndDislikes, userId, post.id);
      const onlyLikes = likesAndDislikes.filter((item) => item.status === StatusLike.Like);
      const lastThreeLikes = JSON.parse(JSON.stringify(onlyLikes)).filter((l) => l.parentId === post.id);
      lastThreeLikes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      if (lastThreeLikes.length > 3) {
        lastThreeLikes.length = 3;
      }

      preparedResult.push({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          dislikesCount: likesInfo.dislikesCount,
          likesCount: likesInfo.likesCount,
          myStatus: likesInfo.myStatus,
          newestLikes: lastThreeLikes.map((like) => ({
            addedAt: like.createdAt,
            userId: like.userId,
            login: like.login,
          })),
        },
      });
    }
    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: preparedResult,
    };
  }

  findPost(id: string): Promise<PostDocument> {
    return this.PostModel.findOne({ id: id, isBanned: false }, DEFAULT_PROJECTION).exec();
  }

  async createPost(post: INewPostDto): Promise<PostDocument> {
    return new this.PostModel({ ...post });
  }

  async updatePost(post: UpdatePostDto, id: string): Promise<boolean> {
    const { title, shortDescription, content } = post;

    const result = await this.PostModel.updateOne(
      { id },
      {
        $set: { title, shortDescription, content },
      },
    );

    return !!result.matchedCount;
  }

  async removePost(id: string): Promise<boolean> {
    const res = await this.PostModel.deleteOne({ id });
    return res.deletedCount > 0 ? true : false;
  }

  async removePostByBlogId(blogId: string): Promise<boolean> {
    const res = await this.PostModel.deleteMany({ blogId });
    return res.deletedCount > 0 ? true : false;
  }

  async save(post: PostDocument) {
    return post.save();
  }

  async deleteMany() {
    return this.PostModel.deleteMany({});
  }

  async updateUserBanStatus(userId: string, isBanned: boolean) {
    return this.PostModel.updateMany(
      { userId },
      {
        $set: { isBanned },
      },
    )
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

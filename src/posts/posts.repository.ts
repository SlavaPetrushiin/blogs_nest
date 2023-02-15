import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from './schemas/post.schema';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { AllEntitiesPost } from './dto/AllEntitiesPost';
import { UpdatePostDto } from './dto/update-post.dto';

const DEFAULT_PROJECTION = { _id: 0, __v: 0, updatedAt: 0 };

interface INewPostDto extends CreatePostDto {
  blogName: string;
  blogId: string;
}

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}

  async findAllPosts(query: AllEntitiesPost, blogId: string = null) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (+pageNumber - 1) * +pageSize;
    const postFilter: any = {};

    if (blogId) {
      postFilter.blogId = blogId;
    }

    const result = await this.PostModel.find(postFilter, DEFAULT_PROJECTION)
      .skip(+skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 })
      .lean();

    const totalCount = await this.PostModel.countDocuments({});
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: result.map((post) => ({
        ...post,
        // extendedLikesInfo: {
        //   dislikesCount: 0,
        //   likesCount: 0,
        //   myStatus: 'None',
        //   newestLikes: [],
        // },
      })),
    };
  }

  findPost(id: string): Promise<PostDocument> {
    return this.PostModel.findOne({ id: id }, DEFAULT_PROJECTION).exec();
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
}

import { BlogQueryRepositoryMongodb } from '../../blogs/infrastructure/blog-query.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { LikesRepository } from '../../likes/likes.repository';
import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../models/schemas/post.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

interface INewPostDto extends CreatePostDto {
  blogName: string;
  blogId: string;
  userId: string;
}

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}

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

    return result.matchedCount > 0;
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
    );
  }
}

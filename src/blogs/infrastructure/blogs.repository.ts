import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../models/schemas/blog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { AllEntitiesBlog } from '../dto/AllEntitiesBlog';
import { UpdateBlogDto } from '../dto/update-blog.dto';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async createBlog(blog: CreateBlogDto, userId: string, userLogin: string): Promise<BlogDocument> {
    return new this.BlogModel({
      ...blog,
      blogOwnerInfo: { userId, userLogin },
    });
  }

  async updateBlog(blog: UpdateBlogDto, id: string): Promise<boolean> {
    const { description, name, websiteUrl } = blog;
    const result = await this.BlogModel.updateOne(
      { id },
      {
        $set: { name, websiteUrl, description },
      },
    );

    return !!result.matchedCount;
  }

  async bindBlogWithUser(blogId: string, userId: string, login: string): Promise<boolean> {
    const result = await this.BlogModel.updateOne(
      { id: blogId },
      {
        $set: { 'blogOwnerInfo.userId': userId, 'blogOwnerInfo.userLogin': login },
      },
    );

    return result.matchedCount > 0;
  }

  async removeBlog(id: string): Promise<boolean> {
    const res = await this.BlogModel.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async updateUserBanStatus(userId: string, isBanned: boolean) {
    return this.BlogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      {
        $set: { isBanned },
      },
    );
  }

  async banOrUnbanBlogByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.BlogModel.updateOne(
      {
        id: blogId,
      },
      {
        $set: { isBanned },
      },
    );

    return result.matchedCount > 0;
  }

  async save(blog: BlogDocument) {
    return blog.save();
  }

  async deleteMany() {
    return this.BlogModel.deleteMany({});
  }
}

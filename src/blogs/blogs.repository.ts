import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { AllEntitiesBlog } from './dto/AllEntitiesBlog';
import { UpdateBlogDto } from './dto/update-blog.dto';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findAllBlogs(query: AllEntitiesBlog) {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = query;
    const filter = {
      isBanned: false,
      name: {
        $regex: searchNameTerm,
        $options: 'i',
      },
    };
    const skip = (+pageNumber - 1) * +pageSize;

    const result = await this.BlogModel.find(filter, { ...DEFAULT_PROJECTION, blogOwnerInfo: 0, isBanned: 0 })
      .skip(+skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  async findAllBlogsBySA(query: AllEntitiesBlog, userId?: string) {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = query;
    const filter = {
      isBanned: false,
      name: {
        $regex: searchNameTerm,
        $options: 'i',
      },
    };

    if (userId) {
      filter['blogOwnerInfo.userId'] = userId;
    }

    const skip = (+pageNumber - 1) * +pageSize;

    const result = await this.BlogModel.find(filter, { ...DEFAULT_PROJECTION, isBanned: 0 })
      .skip(+skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  async findBlog(id: string): Promise<BlogDocument> {
    return this.BlogModel.findOne({ id, isBanned: false }, { ...DEFAULT_PROJECTION, isBanned: 0, blogOwnerInfo: 0 }).exec();
  }

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
        $set: { userId: userId, userLogin: login },
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
      { userId },
      {
        $set: { isBanned },
      },
    );
  }

  async save(blog: BlogDocument) {
    return blog.save();
  }

  async deleteMany() {
    return this.BlogModel.deleteMany({});
  }
}

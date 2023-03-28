import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../models/schemas/blog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AllEntitiesBlog } from '../dto/AllEntitiesBlog';

const DEFAULT_PROJECTION = { _id: 0, __v: 0 };

@Injectable()
export class BlogQueryRepositoryMongodb {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findAllBlogs(query: AllEntitiesBlog, userId?: string) {
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

  async findBlogWithOwnerInfo(id: string): Promise<BlogDocument> {
    return this.BlogModel.findOne({ id, isBanned: false }, { ...DEFAULT_PROJECTION, isBanned: 0 }).exec();
  }

  async findAllBannedBlogsIDs(): Promise<{ id: string }[]> {
    return this.BlogModel.find({ isBanned: true }, { id: 1 });
  }
}
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
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } =
      query;
    const skip = (+pageNumber - 1) * +pageSize;

    const result = await this.BlogModel.find(
      { name: { $regex: searchNameTerm, $options: '$i' } },
      DEFAULT_PROJECTION,
    )
      .skip(+skip)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection == 'asc' ? 1 : -1 });

    const totalCount = await this.BlogModel.countDocuments({
      name: { $regex: searchNameTerm, $options: '$i' },
    });
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  findBlog(id: string): Promise<BlogDocument> {
    return this.BlogModel.findOne({ id }, DEFAULT_PROJECTION).exec();
  }

  async createBlog(blog: CreateBlogDto): Promise<BlogDocument> {
    return new this.BlogModel({ ...blog });
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

  async removeBlog(id: string): Promise<boolean> {
    const res = await this.BlogModel.deleteOne({ _id: id });
    return res.deletedCount > 0 ? true : false;
  }

  async save(blog: BlogDocument) {
    return blog.save();
  }

  async deleteMany() {
    return this.BlogModel.deleteMany({});
  }
}

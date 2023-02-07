import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { IBlog } from './interfaces/blog.interface';
import { BlogDocument } from './schemas/blog.schema';
import { BlogsRepository } from './blogs.repository';
import { AllEntitiesBlog } from './dto/AllEntitiesBlog';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  private readonly blogs: IBlog[] = [];

  constructor(private blogsRepository: BlogsRepository) {}

  async getBlogs(query: AllEntitiesBlog) {
    return this.blogsRepository.findAllBlogs(query);
  }

  async getBlog(id: Types.ObjectId): Promise<BlogDocument> {
    return this.blogsRepository.findBlog(id);
  }

  async createBlog(blog: CreateBlogDto): Promise<BlogDocument> {
    const cratedBlog = await this.blogsRepository.createBlog(blog);
    return this.blogsRepository.save(cratedBlog);
  }

  async updateBlog(blog: UpdateBlogDto, id: Types.ObjectId) {
    return this.blogsRepository.updateBlog(blog, id);
  }

  async removeBlog(id: Types.ObjectId): Promise<boolean> {
    return this.blogsRepository.removeBlog(id);
  }
}

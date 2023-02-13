import { PostsRepository } from './../posts/posts.repository';
import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { IBlog } from './interfaces/blog.interface';
import { BlogDocument } from './schemas/blog.schema';
import { BlogsRepository } from './blogs.repository';
import { AllEntitiesBlog } from './dto/AllEntitiesBlog';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AllEntitiesPost } from 'src/posts/dto/AllEntitiesPost';
import {
  CreatePostByBlogIdDto,
  CreatePostDto,
} from 'src/posts/dto/create-post.dto';

@Injectable()
export class BlogsService {
  private readonly blogs: IBlog[] = [];

  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async getBlogs(query: AllEntitiesBlog) {
    return this.blogsRepository.findAllBlogs(query);
  }

  async getBlog(id: string): Promise<BlogDocument> {
    return this.blogsRepository.findBlog(id);
  }

  async createBlog(blog: CreateBlogDto): Promise<BlogDocument> {
    const cratedBlog = await this.blogsRepository.createBlog(blog);
    return this.blogsRepository.save(cratedBlog);
  }

  async updateBlog(blog: UpdateBlogDto, id: string) {
    return this.blogsRepository.updateBlog(blog, id);
  }

  async removeBlog(id: string): Promise<boolean> {
    const isDeleted = await this.blogsRepository.removeBlog(id);
    if (isDeleted) {
      this.postsRepository.removePostByBlogId(id);
    }
    return isDeleted;
  }

  async getPostsByBlogId(query: AllEntitiesPost, blogId: string) {
    const foundedBlog = await this.blogsRepository.findBlog(blogId);
    if (!foundedBlog) {
      return null;
    }

    return this.postsRepository.findAllPosts(query, blogId);
  }

  async createPostByBlogId(
    createPostByBlogIdDto: CreatePostByBlogIdDto,
    blogId: string,
  ) {
    const foundedBlog = await this.blogsRepository.findBlog(blogId);
    if (!foundedBlog) {
      return null;
    }
    const { content, shortDescription, title } = createPostByBlogIdDto;
    const cratedPost = await this.postsRepository.createPost({
      title,
      shortDescription,
      content,
      blogId: foundedBlog.id,
      blogName: foundedBlog.name,
    });

    await this.postsRepository.save(cratedPost);

    return {
      ...cratedPost,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}

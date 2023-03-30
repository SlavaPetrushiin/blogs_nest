import { BanBlogDto } from './../../blogger/dto/ban-blog.dto';
import { PostsRepository } from '../../posts/posts.repository';
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogDocument } from '../models/schemas/blog.schema';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { AllEntitiesPost } from 'src/posts/dto/AllEntitiesPost';
import { CreatePostByBlogIdDto } from 'src/posts/dto/create-post.dto';
import { BlogQueryRepositoryMongodb } from '../infrastructure/blog-query.repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private readonly blogRepository: BlogQueryRepositoryMongodb,
  ) {}

  async createBlog(blog: CreateBlogDto, userId: string, userLogin: string) {
    const cratedBlog = await this.blogsRepository.createBlog(blog, userId, userLogin);
    await this.blogsRepository.save(cratedBlog);
    return {
      id: cratedBlog.id,
      name: cratedBlog.name,
      description: cratedBlog.description,
      websiteUrl: cratedBlog.websiteUrl,
      createdAt: cratedBlog.createdAt,
      isMembership: cratedBlog.isMembership,
    };
  }

  async updateBlog(blog: UpdateBlogDto, blogId: string, userId: string) {
    const foundBlog = await this.getExistingBlog(blogId);

    if (foundBlog.blogOwnerInfo.userId != userId) {
      throw new ForbiddenException();
    }

    return this.blogsRepository.updateBlog(blog, blogId);
  }

  async removeBlog(blogId: string, userId: string): Promise<boolean> {
    const foundBlog = await this.getExistingBlog(blogId);

    if (foundBlog.blogOwnerInfo.userId != userId) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.blogsRepository.removeBlog(blogId);
    if (isDeleted) {
      this.postsRepository.removePostByBlogId(blogId);
    }
    return isDeleted;
  }
  //Move to post query
  async getPostsByBlogId(query: AllEntitiesPost, userId: string, blogId: string) {
    return this.postsRepository.findAllPosts(query, userId, blogId);
  }

  async createPostByBlogId(createPostByBlogIdDto: CreatePostByBlogIdDto, blogId: string) {
    const foundBlog = await this.getExistingBlog(blogId);

    const { content, shortDescription, title } = createPostByBlogIdDto;
    const cratedPost = await this.postsRepository.createPost({
      title,
      shortDescription,
      content,
      blogId: foundBlog.id,
      blogName: foundBlog.name,
      userId: foundBlog.blogOwnerInfo.userId,
    });
    await this.postsRepository.save(cratedPost);

    return {
      id: cratedPost.id,
      title: cratedPost.title,
      shortDescription: cratedPost.shortDescription,
      content: cratedPost.content,
      blogId: cratedPost.blogId,
      blogName: cratedPost.blogName,
      createdAt: cratedPost.createdAt,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
  //If user ban
  async banOrUnbanBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    await this.getExistingBlog(blogId);
    return this.blogsRepository.banOrUnbanBlogByBlogId(blogId, isBanned);
  }

  //ban a blog for a specific user
  async banOrUnbanBlogForUser(dto: BanBlogDto, userId: string, login: string) {
    return this.blogsRepository.banOrUnbanBlogForUser(dto, userId, login);
  }

  async getExistingBlog(blogId: string): Promise<BlogDocument> {
    const foundBlog = await this.blogRepository.findBlogWithOwnerInfo(blogId);
    if (!foundBlog) {
      throw new NotFoundException();
    }

    return foundBlog;
  }
}

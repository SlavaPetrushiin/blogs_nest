import { PostsRepository } from '../../posts/posts.repository';
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogDocument } from '../models/schemas/blog.schema';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { AllEntitiesBlog } from '../dto/AllEntitiesBlog';
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

  async updateBlog(blog: UpdateBlogDto, id: string, userId: string) {
    const foundBlog = await this.blogRepository.findBlogWithOwnerInfo(id);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    if (foundBlog.blogOwnerInfo.userId != userId) {
      throw new ForbiddenException();
    }

    return this.blogsRepository.updateBlog(blog, id);
  }

  async removeBlog(id: string, userId: string): Promise<boolean> {
    const foundBlog = await this.blogRepository.findBlogWithOwnerInfo(id);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    if (foundBlog.blogOwnerInfo.userId != userId) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.blogsRepository.removeBlog(id);
    if (isDeleted) {
      this.postsRepository.removePostByBlogId(id);
    }
    return isDeleted;
  }

  async getPostsByBlogId(query: AllEntitiesPost, userId: string, blogId: string) {
    return this.postsRepository.findAllPosts(query, userId, blogId);
  }

  async createPostByBlogId(createPostByBlogIdDto: CreatePostByBlogIdDto, blogId: string) {
    const foundedBlog = await this.blogRepository.findBlogWithOwnerInfo(blogId);
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
      userId: foundedBlog.blogOwnerInfo.userId,
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

  async banOrUnbanBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    const foundBlog = await this.blogRepository.findBlog(blogId);
    if (!foundBlog) throw new NotFoundException();

    return this.blogsRepository.banOrUnbanBlogByBlogId(blogId, isBanned);
  }
}

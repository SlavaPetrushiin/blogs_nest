import { BlogQueryRepositoryMongodb } from './../blogs/infrastructure/blog-query.repository';
import { LikeStatusDto } from './../likes/dto/like.dto';
import { LikesRepository } from './../likes/likes.repository';
import { StatusLike } from './../likes/schemas/likes.schema';
import { AllEntitiesComment } from './../comments/dto/allEntitiesComment';
import { CommentsRepository } from './../comments/comments.repository';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { AllEntitiesPost } from './dto/allEntitiesPost';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private commentsRepository: CommentsRepository,
    private likesRepository: LikesRepository,
    private blogQueryRepository: BlogQueryRepositoryMongodb,
  ) {}

  async getPosts(params: AllEntitiesPost, userId: string) {
    return this.postsRepository.findAllPosts(params, userId);
  }

  async getPost(postId: string, userId: string) {
    const foundedPost = await this.postsRepository.findPost(postId);
    const bannedBlogsIds = await this.blogQueryRepository.findAllBannedBlogsIDs();

    if (!foundedPost || bannedBlogsIds.some((b) => b.id === foundedPost.blogId)) {
      throw new NotFoundException();
    }

    const likesAndDislikes = await this.likesRepository.findLikesDislikesByParentsId([postId], 'post');
    const likesInfo = this.postsRepository.getLikesInfo(likesAndDislikes, userId, foundedPost.id);
    const onlyLikes = likesAndDislikes.filter((item) => item.status === StatusLike.Like);
    const lastThreeLikes = JSON.parse(JSON.stringify(onlyLikes));
    lastThreeLikes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (lastThreeLikes.length > 3) {
      lastThreeLikes.length = 3;
    }

    return {
      id: foundedPost.id,
      title: foundedPost.title,
      shortDescription: foundedPost.shortDescription,
      content: foundedPost.content,
      blogId: foundedPost.blogId,
      blogName: foundedPost.blogName,
      createdAt: foundedPost.createdAt,
      extendedLikesInfo: {
        dislikesCount: likesInfo.dislikesCount,
        likesCount: likesInfo.likesCount,
        myStatus: likesInfo.myStatus,
        newestLikes: lastThreeLikes.map((like) => ({
          addedAt: like.createdAt,
          userId: like.userId,
          login: like.login,
        })),
      },
    };
  }

  async createPost(post: CreatePostDto) {
    const { blogId, content, shortDescription, title } = post;

    const foundedBlog = await this.blogQueryRepository.findBlog(blogId);
    if (!foundedBlog) {
      return null;
    }

    const cratedPost = await this.postsRepository.createPost({
      title,
      shortDescription,
      content,
      blogId,
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

  async updatePost(post: UpdatePostDto, id: string) {
    // const { blogId } = post;

    // const foundedBlog = await this.blogsRepository.findBlog(blogId);

    // if (!foundedBlog) {
    //   return null;
    // }

    return this.postsRepository.updatePost(post, id);
  }

  async removePost(id: string): Promise<boolean> {
    return this.postsRepository.removePost(id);
  }

  async getCommentsByPostId(query: AllEntitiesComment, postId: string, userId: string) {
    const foundedPost = await this.postsRepository.findPost(postId);
    if (!foundedPost) {
      return null;
    }

    return this.commentsRepository.getCommentsByPostId(query, postId, userId);
  }

  async addLikeOrDislike(postId: string, likeStatus: StatusLike, userId: string, login: string) {
    const post = await this.getPost(postId, userId);

    if (!post) {
      throw new NotFoundException();
    }

    return this.likesRepository.updateLike({ likeStatus, parentId: post.id, type: 'post', userId, login });
  }
}

import { CommentDocument } from './schemas/comment.schema';
import { AllEntitiesComment } from './dto/allEntitiesComment';
import { CommentsRepository } from './comments.repository';
import { BlogsRepository } from '../blogs/blogs.repository';

import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}

  // async getPosts(query: AllEntitiesPost) {
  //   return this.postsRepository.findAllPosts(query);
  // }

  async getComment(id: string): Promise<CommentDocument> {
    return this.commentsRepository.findPost(id);
  }

  // async createPost(post: CreatePostDto): Promise<PostDocument> {
  //   const { blogId, content, shortDescription, title } = post;

  //   const foundedBlog = await this.blogsRepository.findBlog(blogId);

  //   if (!foundedBlog) {
  //     return null;
  //   }

  //   const cratedPost = await this.postsRepository.createPost({
  //     title,
  //     shortDescription,
  //     content,
  //     blogId,
  //     blogName: foundedBlog.name,
  //   });

  //   return this.postsRepository.save(cratedPost);
  // }

  // async updatePost(post: UpdatePostDto, id: string) {
  //   const { blogId } = post;

  //   const foundedBlog = await this.blogsRepository.findBlog(blogId);

  //   if (!foundedBlog) {
  //     return null;
  //   }

  //   return this.postsRepository.updatePost(post, id);
  // }

  // async removePost(id: string): Promise<boolean> {
  //   return this.postsRepository.removePost(id);
  // }

  // async getCommentsByPostId(query: AllEntitiesComment, postId: string) {
  //   const foundedPost = await this.postsRepository.findPost(postId);
  //   if (!foundedPost) {
  //     return null;
  //   }

  //   return this.commentsRepository.getCommentsByPostId(query, postId);
  // }
}

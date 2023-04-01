import { LikesRepository } from './../likes/likes.repository';
import { CreateOrUpdateLikeDto } from './../likes/likes.service';
import { UsersService } from './../users/users.service';
import { StatusLike } from './../likes/schemas/likes.schema';
import { PostsService } from './../posts/posts.service';
import { CommentsRepository } from './comments.repository';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

export interface IParamsCreateComment {
  userId: string;
  userLogin: string;
  postId: string;
  content: string;
}

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsService: PostsService,
    private usersService: UsersService,
    private likesRepository: LikesRepository,
  ) {}

  async getComment(commentId: string, userId: string) {
    return this.commentsRepository.findComment(commentId, userId);
  }

  async createComment(params: Omit<IParamsCreateComment, 'userLogin'>) {
    const user = await this.usersService.findUserById(params.userId);
    const newComment = await this.commentsRepository.createComment({
      ...params,
      userLogin: user.login,
    });

    await this.commentsRepository.save(newComment);

    return {
      id: newComment.id,
      content: newComment.content,
      commentatorInfo: {
        userId: newComment.userId,
        userLogin: newComment.userLogin,
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.None,
      },
    };
  }

  async updateComment(commentId: string, content: string, userId: string) {
    const foundedComment = await this.commentsRepository.findComment(commentId, userId);
    if (!foundedComment) {
      throw new NotFoundException();
    }

    if (foundedComment.commentatorInfo.userId != userId) {
      throw new ForbiddenException();
    }

    return this.commentsRepository.updateComment(commentId, content);
  }

  async removeComment(commentId: string, userId: string): Promise<boolean> {
    const foundedComment = await this.commentsRepository.findComment(commentId, userId);

    if (!foundedComment) {
      throw new NotFoundException();
    }

    if (foundedComment.commentatorInfo.userId != userId) {
      throw new ForbiddenException();
    }

    return await this.commentsRepository.removeComment(commentId);
  }

  async updateLikes(params: CreateOrUpdateLikeDto) {
    const comment = await this.commentsRepository.findComment(params.parentId, params.userId);
    if (!comment) throw new NotFoundException();

    return this.likesRepository.updateLike(params);
  }
}

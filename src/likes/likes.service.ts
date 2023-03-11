import { LikesRepository } from './likes.repository';
import { StatusLike } from './schemas/likes.schema';
import { Injectable } from '@nestjs/common';

type LikeType = 'post' | 'comment';

export class CreateOrUpdateLikeDto {
  parentId: string;
  likeStatus: StatusLike;
  type: LikeType;
  userId: string;
}

@Injectable()
export class LikesService {
  constructor(private likesRepository: LikesRepository) {}

  async updateLikes(params: CreateOrUpdateLikeDto) {
    const likeOrDislike = await this.likesRepository.updateLike(params);
    return likeOrDislike;
  }
}

import { LikeStatusDto } from './dto/like.dto';
import { LikesRepository } from './likes.repository';
import { Injectable } from '@nestjs/common';

type LikeType = 'post' | 'comment';

export class CreateOrUpdateLikeDto {
  parentId: string;
  likeStatus: LikeStatusDto;
  type: LikeType;
  userId: string;
  login: string;
}

@Injectable()
export class LikesService {
  constructor(private likesRepository: LikesRepository) {}

  async updateLikes(params: CreateOrUpdateLikeDto) {
    return this.likesRepository.updateLike(params);
  }
}

import { StatusLike } from '../schemas/likes.schema';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LikeStatusDto {
  @IsNotEmpty()
  @IsEnum(StatusLike)
  likeStatus: StatusLike;
}

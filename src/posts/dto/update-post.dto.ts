import { CheckBlogId } from './../validators/checkBlogId';
import { IsString, IsUUID, MaxLength, Validate } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @MaxLength(30)
  title: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsUUID()
  @Validate(CheckBlogId, { message: 'Not exist blog' })
  readonly blogId: string;
}

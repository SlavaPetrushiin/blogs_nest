import { CheckBlogId } from './../validators/checkBlogId';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength, Validate } from 'class-validator';
export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsUUID()
  @Validate(CheckBlogId, { message: 'Not exist blog' })
  readonly blogId: string;
}

export class CreatePostByBlogIdDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

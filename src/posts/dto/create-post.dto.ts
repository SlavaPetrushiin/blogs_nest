import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';
export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(1000)
  content: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  blogId: string;
}

export class CreatePostByBlogIdDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(1000)
  content: string;
}

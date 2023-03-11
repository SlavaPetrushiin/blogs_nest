import { IsString, MaxLength } from 'class-validator';
export class CreatePostDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MaxLength(100)
  content: string;

  @IsString()
  blogId: string;
}

export class CreatePostByBlogIdDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @MaxLength(100)
  @IsString()
  content: string;
}

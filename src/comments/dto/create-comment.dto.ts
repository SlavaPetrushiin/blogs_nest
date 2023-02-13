import { IsString } from 'class-validator';
export class CreatePostDto {
  @IsString()
  title: string;
  @IsString()
  shortDescription: string;
  @IsString()
  content: string;
  @IsString()
  blogId: string;
}

export class CreatePostByBlogIdDto {
  title: string;
  @IsString()
  shortDescription: string;
  @IsString()
  content: string;
}

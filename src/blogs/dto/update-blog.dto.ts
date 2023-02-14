import { IsString } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsString()
  websiteUrl: string;
}

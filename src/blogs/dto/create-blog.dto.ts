import { IsString, IsUrl, Max } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Max(15)
  name: string;

  @IsString()
  @Max(500)
  description: string;

  @IsUrl()
  @Max(100)
  websiteUrl: string;
}

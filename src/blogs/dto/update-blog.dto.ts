import { IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @MaxLength(15)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MaxLength(15)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  @MaxLength(100)
  websiteUrl: string;
}

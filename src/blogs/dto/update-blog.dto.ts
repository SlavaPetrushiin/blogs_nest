import { IsString, IsUrl, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @MaxLength(15)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @MaxLength(100)
  @IsNotEmpty()
  websiteUrl: string;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(15)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100)
  websiteUrl: string;
}

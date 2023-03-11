import { Transform } from 'class-transformer';
import { IsString, IsUrl, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateBlogDto {
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
  @MaxLength(100)
  @IsNotEmpty()
  websiteUrl: string;
}

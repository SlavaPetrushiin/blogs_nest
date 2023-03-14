import { Transform } from 'class-transformer';
import { CheckBlogId } from './../validators/checkBlogId';
import { IsString, IsUUID, MaxLength, Validate, IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsUUID()
  @Validate(CheckBlogId, { message: 'Not exist blog' })
  readonly blogId: string;
}

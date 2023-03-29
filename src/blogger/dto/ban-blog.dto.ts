import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MinLength, IsUUID } from 'class-validator';

export class BanBlogDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(20)
  banReason: string;

  @IsUUID()
  blogId: string;
}

import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  title: string;
  @IsString()
  shortDescription: string;
  @IsString()
  content: string;
  @IsString()
  blogId: string;
}

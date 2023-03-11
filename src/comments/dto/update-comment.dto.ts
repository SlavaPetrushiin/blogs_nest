import { IsString, MinLength, MaxLength } from 'class-validator';
export class UpdateCommentDto {
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  content: string;
}

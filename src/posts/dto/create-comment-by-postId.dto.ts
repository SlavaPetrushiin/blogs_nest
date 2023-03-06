import { IsString, Length } from 'class-validator';

export class CreateCommentByPostIdDto {
  @IsString()
  @Length(20, 300)
  content: string;
}

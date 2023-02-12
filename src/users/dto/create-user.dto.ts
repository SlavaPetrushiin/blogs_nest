import { IsString, IsEmail, Length, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(5, 10)
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEmail()
  email: string;
}

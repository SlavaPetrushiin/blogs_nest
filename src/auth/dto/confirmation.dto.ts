import { IsString, IsEmail, Length, IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmationDto {
  @IsUUID()
  code;
}

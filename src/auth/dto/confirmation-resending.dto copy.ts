import { Email } from './../../email/email.service';
import { IsString, IsEmail, Length, IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmationResendingDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email;
}

import { IsString, Length, IsUUID } from 'class-validator';

export class RecoveryPasswordDto {
  @IsUUID()
  recoveryCode: string;

  @IsString()
  @Length(6, 20)
  newPassword: string;
}

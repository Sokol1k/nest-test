import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from '../../decorators/match.decorator'

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  @Match('password', {
    message: 'confirmPassword must match password exactly'
  })
  confirmPassword: string;
}
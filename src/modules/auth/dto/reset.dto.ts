import { IsNotEmpty, IsString, Length, IsEmail } from 'class-validator'
import { Match } from '../../../decorators/match.decorator'

export class ResetDto {
  @IsNotEmpty()
  @IsString()
  resetLink: string;

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
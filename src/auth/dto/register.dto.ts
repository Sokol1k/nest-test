import { IsNotEmpty, IsString, Length, IsEmail } from 'class-validator';
import { Match } from '../../decorators/match.decorator'

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  secondName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

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
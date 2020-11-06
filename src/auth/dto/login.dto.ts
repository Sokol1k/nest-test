import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator'

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  password: string;
}
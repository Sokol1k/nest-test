import { IsNotEmpty, IsEmail } from 'class-validator'

export class ForgetDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
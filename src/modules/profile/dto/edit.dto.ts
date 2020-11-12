import { IsNotEmpty, IsString, Length, IsEmail } from 'class-validator'

export class EditDto {
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
}
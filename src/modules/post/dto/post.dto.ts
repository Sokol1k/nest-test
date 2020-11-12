import { IsNotEmpty, IsString, Length } from "class-validator";

export class PostDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  title: string

  @IsNotEmpty()
  @IsString()
  @Length(5, 1000)
  description: string
}
import { IsEmail, MinLength, IsString } from 'class-validator';

export class createUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

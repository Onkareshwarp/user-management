import { IsEmail, IsString } from 'class-validator';

export class createUserDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;
}

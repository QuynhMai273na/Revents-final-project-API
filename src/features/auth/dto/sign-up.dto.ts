import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  // @IsStrongPassword()
  password: string;

  @IsString()
  @IsOptional()
  displayName: string;
}

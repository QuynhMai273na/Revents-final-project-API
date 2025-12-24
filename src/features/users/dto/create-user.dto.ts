import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  photoUrl: string;

  @IsString()
  @IsOptional()
  description: string;
}

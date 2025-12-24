import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  venue: string;

  @IsOptional()
  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  longitude: number;
}

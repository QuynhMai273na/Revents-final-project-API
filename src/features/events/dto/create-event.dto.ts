// import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

// export class CreateEventDto {
//   @IsString()
//   title: string;

//   @IsString()
//   category: string;

//   @IsDateString()
//   date: Date;

//   @IsOptional()
//   @IsString()
//   description: string;

//   @IsOptional()
//   @IsString()
//   city: string;

//   @IsOptional()
//   @IsString()
//   venue: string;

//   @IsOptional()
//   @IsNumber()
//   latitude: number;

//   @IsOptional()
//   @IsNumber()
//   longitude: number;
// }

import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class VenueDto {
  @IsString()
  venue: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VenueDto)
  venue?: VenueDto;
}

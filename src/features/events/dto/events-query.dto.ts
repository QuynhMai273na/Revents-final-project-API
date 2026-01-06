import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EventQueryDto {
  @IsOptional()
  @IsIn(['all', 'going', 'hosting'])
  query?: 'all' | 'going' | 'hosting';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

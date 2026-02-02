import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';

export class ProfileEventsQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['host', 'attending', 'all'])
  role?: 'host' | 'attending' | 'all';

  @IsOptional()
  @IsIn(['past', 'future', 'all'])
  time?: 'past' | 'future' | 'all';
}

export class ProfileMembersQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['all', 'followers', 'following'])
  mode?: 'all' | 'followers' | 'following';
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthPayload } from '../auth/auth.interface';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import {
  ProfileEventsQueryDto,
  ProfileMembersQueryDto,
} from './dto/profile-query.dto';
import { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '@nestjs/passport';
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.profilesService.findAll(pagination.page, pagination.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') meId: AuthUser['id']) {
    return this.profilesService.findOne(id, meId);
  }

  // update bản thân (không cho update người khác)
  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateMe(
    @CurrentUser('id') currentUserId: AuthUser['id'],
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateMyProfile(currentUserId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/members')
  getMembers(
    @Param('id') id: string,
    @CurrentUser('id') meId: AuthUser['id'],
    @Query() query: ProfileMembersQueryDto,
  ) {
    return this.profilesService.findAllUsers(
      id,
      meId,
      query.mode ?? 'all',
      query.page,
      query.limit,
    );
  }

  // TODO: Use dto to validate
  @Get(':id/events')
  getUserEvents(
    @Param('id') id: string,
    @Query() query: ProfileEventsQueryDto,
  ) {
    return this.profilesService.findUserEvents(id, {
      role: query.role ?? 'all',
      time: query.time ?? 'all',
      page: query.page,
      limit: query.limit,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/follow')
  toggleFollow(
    @CurrentUser('id') userId: AuthUser['id'],
    @Param('id') followingId: string,
  ) {
    return this.profilesService.followService(userId, followingId);
  }
}

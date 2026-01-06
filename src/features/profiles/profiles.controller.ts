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
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthPayload } from '../auth/auth.interface';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') meId: AuthPayload['id']) {
    return this.profilesService.findOne(id, meId);
  }

  // update bản thân (không cho update người khác)
  @UseGuards(AuthGuard)
  @Put('me')
  updateMe(
    @CurrentUser('id') currentUserId: AuthPayload['id'],
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateMyProfile(currentUserId, dto);
  }

  @UseGuards(AuthGuard)
  @Get(':id/members')
  getMembers(
    @Param('id') id: string,
    @CurrentUser('id') meId: AuthPayload['id'],
    @Query('mode') mode: 'all' | 'followers' | 'following' = 'all',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profilesService.findAllUsers(
      id,
      meId,
      mode,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // TODO: Use dto to validate
  @Get(':id/events')
  getUserEvents(
    @Param('id') id: string,
    @Query('role') role: 'host' | 'attending' | 'all' = 'all',
    @Query('time') time: 'past' | 'future' | 'all' = 'all',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profilesService.findUserEvents(id, {
      role,
      time,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @UseGuards(AuthGuard)
  @Post(':id/follow')
  toggleFollow(
    @CurrentUser('id') userId: AuthPayload['id'],
    @Param('id') followingId: string,
  ) {
    return this.profilesService.followService(userId, followingId);
  }
}

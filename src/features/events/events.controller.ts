import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { EventQueryDto } from './dto/events-query.dto';
import { OptionalAuthGuard } from '../auth/guard/optional-auth.guard';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '@nestjs/passport';
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body()
    body: CreateEventDto,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.eventsService.create(body, currentUserId);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(
    @Query() q: EventQueryDto & PaginationDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.eventsService.findAll({ ...q, userId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: UpdateEventDto,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.eventsService.update(id, body, currentUserId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/manage')
  @UseGuards(AuthGuard('jwt'))
  manage(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.eventsService.manage(id, currentUserId);
  }

  @Post(':id/attendees')
  @UseGuards(AuthGuard('jwt'))
  joinEvent(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.eventsService.join(id, currentUserId);
  }

  @Delete(':id/attendees')
  @UseGuards(AuthGuard('jwt'))
  leave(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.eventsService.leave(id, currentUserId);
  }
}

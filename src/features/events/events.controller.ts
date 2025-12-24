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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthPayload } from '../auth/auth.interface';
import { CurrentUser } from '../auth/current-user.decorator';
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body()
    body: CreateEventDto,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.eventsService.create(body, currentUserId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: UpdateEventDto,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.eventsService.update(id, body, currentUserId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/manage')
  @UseGuards(AuthGuard)
  manage(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.eventsService.manage(id, currentUserId);
  }

  @Post(':id/attendees')
  @UseGuards(AuthGuard)
  joinEvent(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.eventsService.join(id, currentUserId);
  }

  @Delete(':id/attendees')
  @UseGuards(AuthGuard)
  leave(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.eventsService.leave(id, currentUserId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '@nestjs/passport';
@Controller('events/:eventId/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Param('eventId') eventId: string,
    @Body() body: CreateChatDto,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.chatsService.create(eventId, currentUserId, body);
  }

  @Get()
  findAll(
    @Param('eventId') eventId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatsService.findAllByEvent(
      eventId,
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateChatDto,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.chatsService.update(id, currentUserId, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.chatsService.remove(id, currentUserId);
  }
}

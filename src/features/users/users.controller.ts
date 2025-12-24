import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/features/auth/current-user.decorator';
import { UsersService } from './users.service';
import UpdateUserDto from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthPayload } from '../auth/auth.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: UpdateUserDto,
    @CurrentUser('id') currentUserId: AuthPayload['id'],
  ) {
    return this.usersService.update(id, body, currentUserId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

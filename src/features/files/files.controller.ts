import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('profiles/:userId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.filesService.uploadFile(file, currentUserId);
  }

  @Get()
  getUserPhotos(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.filesService.getUserFiles(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/set-main')
  setAvatar(
    @Param('id') fileId: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.filesService.setAvatar(fileId, currentUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteFile(
    @Param('id') fileId: string,
    @CurrentUser('id') currentUserId: AuthUser['id'],
  ) {
    return this.filesService.deleteFile(fileId, currentUserId);
  }
}

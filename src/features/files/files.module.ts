import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CloudinaryModule],
  controllers: [FilesController],
  providers: [FilesService, PrismaService, JwtService],
})
export class FilesModule {}

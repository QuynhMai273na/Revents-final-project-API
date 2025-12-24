import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService, JwtService],
})
export class ProfilesModule {}

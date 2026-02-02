import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './features/events/events.module';
import { UsersModule } from './features/users/users.module';
import { PrismaService } from './features/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateConfiguration } from './config/validate-configuration';
import { AuthModule } from './features/auth/auth.module';
import { ProfilesModule } from './features/profiles/profiles.module';
import { ChatsModule } from './features/chats/chats.module';
import { FilesModule } from './features/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    EventsModule,
    UsersModule,
    AuthModule,
    ProfilesModule,
    ChatsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import UpdateUserDto from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthPayload } from '../auth/auth.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // async create(body: CreateUserDto) {
  //   const user = await this.prisma.user.create({ data: body });
  //   return user;
  // }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        hostedEvents: true,
        attendances: {
          include: {
            event: true,
          },
        },
      },
    });
  }
  findOne(id: string) {
    const user = this.prisma.user.findUnique({
      where: { id },
      include: {
        hostedEvents: true,
        attendances: {
          include: {
            event: true,
          },
        },
        followers: true,
        following: true,
      },
    });
    return user;
  }
  async update(id: string, body: UpdateUserDto, currentUserId: string) {
    const user = await this.findOne(id);
    if (!user) throw new Error(`User with id ${id} not found`);

    if (currentUserId !== id)
      throw new Error(`You are not authorized to update this user`);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: body.email,
          displayName: body.displayName,
          photoUrl: body.photoUrl,
          description: body.description,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
  async remove(id: string) {
    // find user
    const user = await this.findOne(id);
    if (!user) throw new Error(`User with id ${id} not found`);

    await this.prisma.eventAttendee.deleteMany({
      where: { userId: id },
    });
    return this.prisma.user.delete({ where: { id } });
  }
}

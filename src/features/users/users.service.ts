import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  normalizePagination,
  buildPaginationMeta,
} from 'src/shared/pagination/pagination.util';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);

    const [total, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          hostedEvents: true,
          attendances: {
            include: {
              event: true,
            },
          },
        },
      }),
    ]);

    return {
      items: users,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
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

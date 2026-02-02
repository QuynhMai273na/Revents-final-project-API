import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';
import {
  normalizePagination,
  buildPaginationMeta,
} from 'src/shared/pagination/pagination.util';

type RoleFilter = 'host' | 'attending' | 'all';
type TimeFilter = 'past' | 'future' | 'all';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}
  async findAll(page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);

    const [total, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          photoUrl: true,
          displayName: true,
          createdAt: true,
          description: true,
          followers: { select: { followerId: true } },
          following: { select: { followingId: true } },
        },
      }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      photoUrl: u.photoUrl,
      displayName: u.displayName,
      createdAt: u.createdAt,
      description: u.description,
      followerCount: u.followers.length,
      followingCount: u.following.length,
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async findOne(userId: string, meId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        photoUrl: true,
        displayName: true,
        createdAt: true,
        description: true,
        _count: { select: { followers: true, following: true } },
        followers: {
          where: { followerId: meId },
          select: { followerId: true },
          take: 1,
        },
      },
    });

    if (!u) throw new Error(`User with id ${userId} not found`);

    return {
      id: u.id,
      photoUrl: u.photoUrl,
      displayName: u.displayName,
      createdAt: u.createdAt,
      description: u.description,
      followerCount: u._count.followers,
      followingCount: u._count.following,
      isFollowing: u.followers.length > 0,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    //TODO: validate - find user, destructuring data from dto

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        photoUrl: dto.photoUrl,
        description: dto.description,
      },
      select: {
        id: true,
        photoUrl: true,
        displayName: true,
        createdAt: true,
        description: true,
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });

    return {
      id: updated.id,
      photoUrl: updated.photoUrl,
      displayName: updated.displayName,
      createdAt: updated.createdAt,
      description: updated.description,
      followerCount: updated.followers.length,
      followingCount: updated.following.length,
    };
  }

  async findUserEvents(
    userId: string,
    opts: { role: RoleFilter; time: TimeFilter; page?: number; limit?: number },
  ) {
    const now = new Date();

    const { role, time } = opts;
    const roleWhere: Prisma.EventWhereInput = {};
    if (role === 'host') {
      roleWhere.hostId = userId;
    } else if (role === 'attending') {
      roleWhere.attendees = { some: { userId } };
    } else {
      roleWhere.OR = [{ hostId: userId }, { attendees: { some: { userId } } }];
    }

    // time condition
    const dateFilter: Prisma.DateTimeFilter['lt' | 'gte'] =
      opts.time === 'past' ? 'lt' : 'gte';

    const where: Prisma.EventWhereInput = {
      ...roleWhere,
      date: { [dateFilter]: now },
    };

    const pagination = normalizePagination(opts.page, opts.limit);

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy: { date: time === 'past' ? 'desc' : 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          host: { select: { id: true, displayName: true, photoUrl: true } },
          attendees: {
            select: {
              userId: true,
              isHost: true,
              user: { select: { id: true, displayName: true, photoUrl: true } },
            },
          },
        },
      }),
    ]);

    return {
      items,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async findAllUsers(
    id: string,
    meId: string,
    mode: 'all' | 'followers' | 'following',
    page?: number,
    limit?: number,
  ) {
    let where: Prisma.UserWhereInput = {};

    if (mode === 'followers') {
      where = { following: { some: { followingId: id } } };
    } else if (mode === 'following') {
      where = { followers: { some: { followerId: id } } };
    } else {
      where = {};
    }

    const pagination = normalizePagination(page, limit);

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          displayName: true,
          photoUrl: true,
          description: true,
          createdAt: true,
          followers: {
            where: { followerId: meId },
            select: { followerId: true },
            take: 1,
          },
        },
      }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      photoUrl: u.photoUrl,
      description: u.description,
      createdAt: u.createdAt,
      isFollowing: u.followers.length > 0,
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async followService(userId: string, followingId: string) {
    if (userId === followingId) {
      throw new BadRequestException("Can't follow yourself");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User with id ${userId} not found`);

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId },
      },
    });

    if (existing) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: { followerId: userId, followingId },
        },
      });
      return { isFollowing: false, action: 'unfollowed' as const };
    }

    const follow = await this.prisma.follow.create({
      data: { followerId: userId, followingId },
    });

    return { isFollowing: true, action: 'followed' as const, follow };
  }
}

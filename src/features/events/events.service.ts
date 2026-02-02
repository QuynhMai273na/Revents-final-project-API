import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  normalizePagination,
  buildPaginationMeta,
} from 'src/shared/pagination/pagination.util';
export type EventQuery = {
  query?: 'all' | 'going' | 'hosting';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  userId?: string;
};
@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateEventDto, hostId: string) {
    const venueObj = body.venue;

    const event = await this.prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        date: new Date(body.date),

        venue: venueObj?.venue ?? '',
        city: venueObj?.city ?? '',
        latitude: venueObj?.latitude ?? 0,
        longitude: venueObj?.longitude ?? 0,

        host: {
          connect: { id: hostId },
        },
        attendees: {
          create: {
            user: { connect: { id: hostId } },
            isHost: true,
          },
        },
      },
    });

    return event;
  }

  async findAll({
    query = 'all',
    startDate,
    endDate,
    page,
    limit,
    userId,
  }: EventQuery) {
    const where: any = {};
    //  chỉ lấy events đã qua

    // startDate filter
    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        const from = new Date(startDate);
        if (!Number.isNaN(from.getTime())) {
          where.date.gte = from;
        }
      }

      if (endDate) {
        const to = new Date(endDate);
        if (!Number.isNaN(to.getTime())) {
          where.date.lte = to;
        }
      }
    }

    if (userId) {
      // 2) query filter
      if (query === 'hosting') {
        where.hostId = userId;
      }

      if (query === 'going') {
        // event có attendee userId
        where.attendees = {
          some: { userId }, // Prisma relation filter
        };
      }
    }

    const pagination = normalizePagination(page, limit);

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy: { date: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          host: true,
          attendees: { include: { user: true } },
        },
      }),
    ]);

    return {
      items,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  findOne(id: string) {
    const event = this.prisma.event.findUnique({
      where: { id },
      include: {
        host: true,
        attendees: {
          include: { user: true },
        },
      },
    });

    return event;
  }

  async update(id: string, body: UpdateEventDto, hostId: string) {
    const event = await this.findOne(id);

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    if (event.hostId !== hostId) {
      throw new Error(`You are not authorized to update this event`);
    }

    try {
      const { venue, ...rest } = body;

      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          ...rest,
          date: body.date ? new Date(body.date) : event.date,

          venue: venue?.venue ?? event.venue,
          city: venue?.city ?? event.city,
          latitude: venue?.latitude ?? event.latitude,
          longitude: venue?.longitude ?? event.longitude,
        },
      });

      return updatedEvent;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    await this.prisma.eventAttendee.deleteMany({
      where: { eventId: id },
    });

    return this.prisma.event.delete({
      where: { id },
    });
  }
  async manage(id: string, hostId: string) {
    const event = await this.findOne(id);

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    if (event.hostId !== hostId) {
      throw new Error(`You are not authorized to cancel this event`);
    }
    // TODO: check if (date time)

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        isCancelled: !event.isCancelled,
      },
      include: {
        host: true,
        attendees: {
          include: { user: true },
        },
      },
    });

    return updated;
  }

  // User join event
  async join(id: string, userId: string) {
    const event = await this.findOne(id);
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }

    // Nếu đã là attendee rồi thì thôi, không tạo lại
    const existing = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (!existing) {
      await this.prisma.eventAttendee.create({
        data: {
          eventId: id,
          userId,
          isHost: false,
        },
      });
    }

    // Trả event đầy đủ
    return this.findOne(id);
  }

  // User cancel attendance
  async leave(id: string, userId: string) {
    const event = await this.findOne(id);
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }

    await this.prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    return this.findOne(id);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export type EventQuery = {
  query?: 'all' | 'going' | 'hosting';
  startDate?: string;
  page?: number;
  limit?: number;
  userId?: string;
};
@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateEventDto, hostId: string) {
    const event = await this.prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        date: new Date(body.date),
        city: body.city,
        venue: body.venue,
        latitude: body.latitude ?? 0,
        longitude: body.longitude ?? 0,

        host: {
          connect: {
            id: hostId,
          },
        },
        attendees: {
          create: {
            user: {
              connect: {
                id: hostId,
              },
            },
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
    page = 1,
    limit = 10,
    userId,
  }: EventQuery) {
    const where: any = {};

    // startDate filter
    if (startDate) {
      const parsed = new Date(startDate);
      if (!Number.isNaN(parsed.getTime())) {
        where.date = { gte: parsed };
      }
    }

    // 2) query filter
    if (query === 'hosting') {
      if (!userId) {
        return {
          items: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      where.hostId = userId;
    }

    if (query === 'going') {
      if (!userId) {
        return {
          items: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      // event có attendee userId
      where.attendees = {
        some: { userId }, // Prisma relation filter
      };
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50); // chống spam
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy: { date: 'asc' },
        skip,
        take: safeLimit,
        include: {
          host: true,
          attendees: { include: { user: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
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
      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          ...body,
          date: body.date ? new Date(body.date) : event.date,
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

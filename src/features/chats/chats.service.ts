import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizePagination,
  buildPaginationMeta,
} from 'src/shared/pagination/pagination.util';
@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(eventId: string, userId: string, body: CreateChatDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const chat = await this.prisma.chat.create({
      data: {
        content: body.content,
        event: {
          connect: { id: eventId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    if (chat) {
      return chat;
    }
  }

  async findAllByEvent(eventId: string, page?: number, limit?: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const pagination = normalizePagination(page, limit);

    const [total, chats] = await Promise.all([
      this.prisma.chat.count({ where: { eventId } }),
      this.prisma.chat.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: { user: true },
      }),
    ]);

    return {
      items: chats,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async findOne(id: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async update(id: string, userId: string, updateChatDto: UpdateChatDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this chat');
    }

    const updatedChat = await this.prisma.chat.update({
      where: { id },
      data: {
        ...updateChatDto,
      },
    });
    return updatedChat;
  }

  async remove(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const event = await this.prisma.event.findUnique({
      where: { id: chat.eventId },
      select: { hostId: true },
    });
    const isHost = event?.hostId === userId;
    if (chat.userId !== userId && !isHost) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    await this.prisma.chat.delete({
      where: { id },
    });
  }
}

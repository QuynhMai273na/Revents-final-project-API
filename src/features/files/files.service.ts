import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import {
  normalizePagination,
  buildPaginationMeta,
} from 'src/shared/pagination/pagination.util';
@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // =========================
  // Upload file
  // =========================
  async uploadFile(file: Express.Multer.File, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { url, public_id } = await this.cloudinary.uploadImage(
      file,
      'avatars',
    );

    return this.prisma.photo.create({
      data: {
        url: url,
        isMain: false,
        publicId: public_id,
        userId,
      },
    });
  }

  // =========================
  // Get user files
  // =========================
  async getUserFiles(userId: string, page?: number, limit?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pagination = normalizePagination(page, limit);

    const [total, files] = await Promise.all([
      this.prisma.photo.count({ where: { userId } }),
      this.prisma.photo.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return {
      items: files,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  // =========================
  // Delete file
  // =========================
  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.photo.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this file');
    }

    if (file.isMain) {
      throw new BadRequestException('Cannot delete main avatar');
    }

    await this.cloudinary.deleteImage(file.publicId);

    return this.prisma.photo.delete({
      where: { id: fileId },
    });
  }

  // =========================
  // Set avatar
  // =========================
  async setAvatar(fileId: string, userId: string) {
    const file = await this.prisma.photo.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.prisma.$transaction([
      this.prisma.photo.updateMany({
        where: { userId },
        data: { isMain: false },
      }),
      this.prisma.photo.update({
        where: { id: fileId },
        data: { isMain: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { photoUrl: file.url },
      }),
    ]);

    return { message: 'Avatar updated successfully' };
  }
}

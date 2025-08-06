import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createUserDto } from './dtos/create.user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name); // ✅ create instance

  constructor(private readonly prisma: PrismaService) {}

  async createUserFromAuth(data: createUserDto): Promise<void> {
    const { email, id } = data;
    const existingUser = await this.prisma.user.findUnique({
      where: { authUserId: id },
    });

    if (!existingUser) {
      await this.prisma.user.create({
        data: {
          authUserId: id,
          email,
        },
      });
    } else if (existingUser.email !== email) {
      this.logger.warn(
        `Mismatch: ID ${id} already exists with different email`,
      );
    }
  }
}

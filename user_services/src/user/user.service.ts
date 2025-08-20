import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { createUserDto } from './dtos/create.user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name); // ✅ create instance

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

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

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { authUserId: userId },
      select: {
        email: true,
        phone: true,
        name: true,
      },
    });
  }

  async updateUserProfile(
    userId: string,
    userPayload: { phone: string; name: string },
  ) {
    try {
      await this.prisma.user.update({
        where: { authUserId: userId },
        data: {
          name: userPayload.name,
          phone: userPayload.phone,
        },
      });
      return { message: 'Profile updated successfully' };
    } catch (error) {
      this.logger.error(`Profile update failed: ${error.message}`);
      throw new InternalServerErrorException('Profile update failed');
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { authUserId: userId },
      });
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }
      const deletedUser = await this.prisma.user.delete({
        where: { authUserId: userId },
      });

      this.userClient.emit('user_deleted', {
        id: userId,
      });
      return { message: 'User deleted successfully', user: deletedUser };
    } catch (error) {
      this.logger.error(`User deletion failed: ${error.message}`);
      throw new InternalServerErrorException('User deletion failed');
    }
  }
}

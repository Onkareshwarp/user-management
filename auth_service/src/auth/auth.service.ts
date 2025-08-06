import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';

import { createUserDto } from './dtos/create.user.dto';
import { loginDtos } from './dtos/login.user.dtos';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  getUser(cat: string): string {
    return `This action adds a new cat with name ${cat}`;
  }

  async signUp(dtos: createUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dtos.email,
      },
    });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hassPassword = await bcrypt.hash(dtos.password, 10);

    const createUser = await this.prisma.user.create({
      data: {
        email: dtos.email,
        password: hassPassword,
      },
    });

    this.userClient.emit('user_created', {
      id: createUser.id,
      email: createUser.email,
    });
    const { password, ...userWithoutPassword } = createUser;
    return userWithoutPassword;
  }

  async signIn(dtos: loginDtos): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dtos.email,
      },
    });
    if (!user) {
      throw new ConflictException('User with this email does not exist');
    }
    const isPasswordValid = await bcrypt.compare(dtos.password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid password');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockUserClient = {
  emit: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'USER_SERVICE', useValue: mockUserClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a string with the cat name', () => {
      expect(service.getUser('Tom')).toBe(
        'This action adds a new cat with name Tom',
      );
    });
  });

  describe('signUp', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@mail.com',
        password: 'hashed',
      });
      await expect(
        service.signUp({ email: 'test@mail.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user and emit event', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: 'test@mail.com',
        password: 'hashedPassword',
      });

      const result = await service.signUp({
        email: 'test@mail.com',
        password: '123456',
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { email: 'test@mail.com', password: 'hashedPassword' },
      });
      expect(mockUserClient.emit).toHaveBeenCalledWith('user_created', {
        id: 1,
        email: 'test@mail.com',
      });
      expect(result).toEqual({ id: 1, email: 'test@mail.com' });
    });
  });

  describe('signIn', () => {
    it('should throw ConflictException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.signIn({ email: 'notfound@mail.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    // it('should throw ConflictException if password is invalid', async () => {
    //   mockPrismaService.user.findUnique.mockResolvedValue({
    //     id: 1,
    //     email: 'test@mail.com',
    //     password: 'hashedPassword',
    //   });
    //   jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as boolean);

    //   await expect(
    //     service.signIn({ email: 'test@mail.com', password: 'wrongpass' }),
    //   ).rejects.toThrow(ConflictException);
    // });

    // it('should return accessToken if credentials are valid', async () => {
    //   mockPrismaService.user.findUnique.mockResolvedValue({
    //     id: 1,
    //     email: 'test@mail.com',
    //     password: 'hashedPassword',
    //   });
    //   jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
    //   mockJwtService.sign.mockReturnValue('jwt-token');

    //   const result = await service.signIn({
    //     email: 'test@mail.com',
    //     password: '123456',
    //   });

    //   expect(mockJwtService.sign).toHaveBeenCalledWith({
    //     email: 'test@mail.com',
    //     sub: 1,
    //   });
    //   expect(result).toEqual({ accessToken: 'jwt-token' });
    // });
  });
  describe('signUp', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'existing@mail.com',
        password: 'hashedPassword',
      });

      await expect(
        service.signUp({ email: 'existing@mail.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password, create user, emit event, and return user without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue({
        id: 2,
        email: 'newuser@mail.com',
        password: 'hashedPassword',
      });

      const result = await service.signUp({
        email: 'newuser@mail.com',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { email: 'newuser@mail.com', password: 'hashedPassword' },
      });
      expect(mockUserClient.emit).toHaveBeenCalledWith('user_created', {
        id: 2,
        email: 'newuser@mail.com',
      });
      expect(result).toEqual({ id: 2, email: 'newuser@mail.com' });
    });
  });
});

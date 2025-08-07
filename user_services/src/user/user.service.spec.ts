import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createUserFromAuth', () => {
    const data = { id: 'abc123', email: 'test@example.com' };

    it('should create a new user if not existing', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({});

      await service.createUserFromAuth(data);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { authUserId: data.id },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { authUserId: data.id, email: data.email },
      });
    });

    it('should not create user if user already exists with same email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        authUserId: data.id,
        email: data.email,
      });

      await service.createUserFromAuth(data);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should log a warning if user exists with different email', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        authUserId: data.id,
        email: 'different@example.com',
      });

      await service.createUserFromAuth(data);

      expect(warnSpy).toHaveBeenCalledWith(
        `Mismatch: ID ${data.id} already exists with different email`,
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should propagate errors from prisma.user.findUnique', async () => {
      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('DB error'));
      await expect(service.createUserFromAuth(data)).rejects.toThrow(
        'DB error',
      );
    });

    it('should propagate errors from prisma.user.create', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockRejectedValueOnce(new Error('Create error'));
      await expect(service.createUserFromAuth(data)).rejects.toThrow(
        'Create error',
      );
    });
  });
});

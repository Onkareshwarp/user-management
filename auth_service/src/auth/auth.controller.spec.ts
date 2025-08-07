import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createUserDto } from './dtos/create.user.dto';
import { loginDtos } from './dtos/login.user.dtos';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    getUser: jest.fn().mockReturnValue('mocked user'),
    signUp: jest.fn().mockImplementation((dto) => {
      const { password, ...rest } = dto;
      return rest;
    }),
    signIn: jest.fn().mockResolvedValue({ accessToken: 'mocked_token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuthStatus', () => {
    it('should return user status from authService', () => {
      expect(controller.getAuthStatus()).toBe('mocked user');
      expect(authService.getUser).toHaveBeenCalledWith('Kitty');
    });
  });

  describe('signUp', () => {
    it('should call authService.signUp and return user without password', async () => {
      const dto: createUserDto = {
        email: 'test@example.com',
        password: 'secret',
      };
      const result = await controller.signUp(dto);
      expect(result).toEqual({
        email: 'test@example.com',
      });
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn and return accessToken', async () => {
      const dto: loginDtos = {
        email: 'test@example.com',
        password: 'secret',
      };
      const result = await controller.signIn(dto);
      expect(result).toEqual({ accessToken: 'mocked_token' });
      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const req = { user: { id: 1, username: 'testuser' } };
      expect(controller.getProfile(req)).toEqual(req.user);
    });
  });
});

// We recommend installing an extension to run jest tests.

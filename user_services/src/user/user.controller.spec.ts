import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUserFromAuth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleUserCreated', () => {
    it('should call userService.createUserFromAuth with the correct data', async () => {
      const data = { id: '123', email: 'test@example.com' };
      await controller.handleUserCreated(data);
      expect(userService.createUserFromAuth).toHaveBeenCalledWith(data);
    });

    it('should await userService.createUserFromAuth', async () => {
      const data = { id: '456', email: 'another@example.com' };
      const promise = Promise.resolve();
      mockUserService.createUserFromAuth.mockReturnValueOnce(promise);
      await expect(controller.handleUserCreated(data)).resolves.toBeUndefined();
      expect(userService.createUserFromAuth).toHaveBeenCalledTimes(1);
    });

    it('should throw if userService.createUserFromAuth throws', async () => {
      const data = { id: '789', email: 'fail@example.com' };
      mockUserService.createUserFromAuth.mockRejectedValueOnce(
        new Error('Failed'),
      );
      await expect(controller.handleUserCreated(data)).rejects.toThrow(
        'Failed',
      );
    });
  });
});

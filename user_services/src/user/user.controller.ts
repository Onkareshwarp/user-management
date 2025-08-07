import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dtos/create.user.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: any) {
    await this.userService.createUserFromAuth(data);
  }
}

import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dtos/create.user.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: createUserDto) {
    await this.userService.createUserFromAuth(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() userPayload: { phone: string; name: string },
  ) {
    return this.userService.updateUserProfile(req.user.userId, userPayload);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}

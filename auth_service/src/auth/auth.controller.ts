import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { createUserDto } from './dtos/create.user.dto';
import { loginDtos } from './dtos/login.user.dtos';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  getAuthStatus(): string {
    return this.authService.getUser('Kitty');
  }
  @Post('register')
  async signUp(
    @Body() dtos: createUserDto,
  ): Promise<Omit<createUserDto, 'password'>> {
    return this.authService.signUp(dtos);
  }

  @Post('login')
  async signIn(@Body() dtos: loginDtos): Promise<{ accessToken: string }> {
    return this.authService.signIn(dtos);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    console.log('It has enter in auth controller');
    return req.user;
  }

  @EventPattern('user_deleted')
  async handleUserDeleted(@Payload() data: { id: string }) {
    console.log('User deleted event received:', data);
    await this.authService.deleteUser(data.id);
  }
}

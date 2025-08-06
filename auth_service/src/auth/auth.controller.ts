import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
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
    return req.user;
  }
}

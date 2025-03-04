import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { emailOrUsername: string; password: string }) {
    const { emailOrUsername, password } = loginDto;
    const token = await this.authService.validateUser(emailOrUsername, password); // ใช้ validateUser
    return token;
  }
}

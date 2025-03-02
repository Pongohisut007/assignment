import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // นำเข้า JwtService

import { UsersService } from '../users/users.service'; // นำเข้า UsersService
import { Users } from '../users/users.entity'; // นำเข้า Users Entity

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService, // นำเข้า JwtService
  ) {}

  // src/typeORM/auth/auth.service.ts
  async validateUser(emailOrUsername: string, password: string) {
    let user: Users;
    try {
      if (emailOrUsername.includes('@')) {
        user = await this.usersService.findOneByEmail(emailOrUsername);
      } else {
        user = await this.usersService.findOneByUsername(emailOrUsername);
      }
      if (!user) throw new NotFoundException('User not found');
      if (!user.password_hash || !password) {
        throw new UnauthorizedException('Password or user data is missing');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
      const token = this.jwtService.sign({ user_id: user.user_id, username: user.username });
      console.log('Generated token payload:', { user_id: user.user_id, username: user.username });
      return token;
    } catch (error) {
      console.error('Error validating user:', error.message, error.stack); // เพิ่มรายละเอียด error
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error; // ส่ง error เฉพาะกลับไป ไม่ทับด้วย InternalServerError
      }
      throw new InternalServerErrorException('An error occurred during authentication');
    }
  }
}

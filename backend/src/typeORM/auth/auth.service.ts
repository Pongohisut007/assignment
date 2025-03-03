// src/typeORM/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ฟังก์ชันช่วยตรวจสอบรหัสผ่าน
  private async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, storedHash] = storedPassword.split(':');
      crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === storedHash);
      });
    });
  }

  async validateUser(emailOrUsername: string, password: string): Promise<string> {
    let user;
    if (emailOrUsername.includes('@')) {
      user = await this.usersService.findOneByEmail(emailOrUsername);
    } else {
      user = await this.usersService.findOneByUsername(emailOrUsername);
    }

    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await this.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    const token = this.jwtService.sign({ user_id: user.user_id, username: user.username });
    return token;
  }
}
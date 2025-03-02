// src/typeORM/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ดึง token จาก header Authorization: Bearer <token>
      ignoreExpiration: false, // ตรวจสอบวันหมดอายุของ token
      secretOrKey: 'your-secret-key', // ต้องตรงกับ secret ที่ใช้ใน JwtModule
    });
  }

  async validate(payload: any) {
    // payload คือข้อมูลที่ decode จาก token (เช่น { user_id, username })
    return { user_id: payload.user_id, username: payload.username }; // เก็บข้อมูลใน req.user
  }
}
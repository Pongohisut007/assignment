// src/typeORM/users/users.controller.ts
import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { Users, UserRole } from './users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() dto: CreateUserDto): Promise<Users> {
    return this.usersService.createUser(dto);
  }

  @Post('/register-admin')
  async registerAdmin(@Body() dto: CreateUserDto): Promise<Users> {
    return this.usersService.createUser(dto, UserRole.ADMIN);
  }

  @Get('/')
  async getAllUsers(): Promise<Users[]> {
    return this.usersService.findAll();
  }
@Get('/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req): Promise<Users> {
    console.log('Hit /users/me, req.user:', req.user); // เพิ่ม log
    const userId = req.user.user_id;
    return this.usersService.findOne(userId);
  }
  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<Users> {
    console.log('Hit /users/:id with id:', id); // เพิ่ม log
    return this.usersService.findOne(id);
  }

  
}
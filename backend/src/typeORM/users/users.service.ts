import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users, UserRole } from './users.entity';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepository: Repository<Users>) {}

  async createUser(dto: CreateUserDto, role: UserRole = UserRole.USER): Promise<Users> {
    const { username, email, password } = dto;

    // ✅ ใช้ QueryBuilder ตรวจสอบซ้ำ
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', { username, email })
      .getOne();

    if (existingUser) {
      throw new ConflictException('Username or Email already exists');
    }

    // ✅ แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password_hash: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  // ✅ สร้าง Admin โดยตรง
  async createAdmin(dto: CreateUserDto): Promise<Users> {
    return this.createUser(dto, UserRole.ADMIN);
  }

  async findAll(): Promise<Users[]> {
    return this.userRepository.find({
      select: ['user_id', 'username', 'email', 'role', 'created_at'],
    });
  }

  // src/typeORM/users/users.service.ts
  async findOne(user_id: number): Promise<Users> {
    console.log('findOne called with user_id:', user_id); // ควรได้ 6
    if (isNaN(user_id)) {
      throw new Error('Invalid user_id: must be a number');
    }
    const user = await this.userRepository.findOne({
      where: { user_id },
      select: ['user_id', 'username', 'email', 'role', 'created_at'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByEmail(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['user_id', 'username', 'email', 'password_hash', 'role', 'created_at'], // เพิ่ม password_hash
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  
  async findOneByUsername(username: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['user_id', 'username', 'email', 'password_hash', 'role', 'created_at'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  
}

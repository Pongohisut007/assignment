import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto'; // เปลี่ยนจาก bcrypt เป็น crypto
import { Users, UserRole } from './users.entity';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepository: Repository<Users>) {}

  // ฟังก์ชันช่วยแฮชรหัสผ่านด้วย crypto
  private async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex'); // สร้าง salt
      crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`); // เก็บ salt และ hash คู่กัน
      });
    });
  }

  async createUser(dto: CreateUserDto, role: UserRole = UserRole.USER): Promise<Users> {
    const { username, email, password } = dto;

    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', { username, email })
      .getOne();

    if (existingUser) {
      throw new ConflictException('Username or Email already exists');
    }

    // แฮชรหัสผ่านด้วย crypto
    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      username,
      email,
      password_hash: hashedPassword, // ใช้ hashedPassword ที่ได้จาก crypto
      role,
    });

    return this.userRepository.save(user);
  }

  async createAdmin(dto: CreateUserDto): Promise<Users> {
    return this.createUser(dto, UserRole.ADMIN);
  }

  async findAll(): Promise<Users[]> {
    return this.userRepository.find({
      select: ['user_id', 'username', 'email', 'role', 'created_at'],
    });
  }

  async findOne(user_id: number): Promise<Users> {
    console.log('findOne called with user_id:', user_id);
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
      select: ['user_id', 'username', 'email', 'password_hash', 'role', 'created_at'],
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
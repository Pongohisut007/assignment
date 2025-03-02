import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsOptional() // กรณีที่ไม่จำเป็นต้องกรอก
  username?: string; // ให้รองรับ username

  @IsEmail()
  @IsNotEmpty()
  @IsOptional() // กรณีที่ไม่จำเป็นต้องกรอก
  email?: string; // ให้รองรับ email

  @IsNotEmpty()
  password: string;
}

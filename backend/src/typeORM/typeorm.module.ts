import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Info } from './info/info.entity';
import { InfoController } from './info/info.controller';
import { InfoService } from './info/info.service';
import { Users } from './users/users.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'world',
      entities: [Info, Users],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Info, Users]),
    JwtModule.register({
      secret: 'your-secret-key', // ต้องตรงกับ JwtStrategy
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [InfoController, UsersController, AuthController],
  providers: [InfoService, UsersService, AuthService, JwtStrategy], // เพิ่ม JwtStrategy
})
export class TypeormModule {}
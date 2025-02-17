import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Info } from './info/info.entity';
import { InfoController } from './info/info.controller';
import { InfoService } from './info/info.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'world',
      entities: [Info],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Info]), 
  ],
  controllers: [InfoController], 
  providers: [InfoService], 
})
export class typeormModule {}

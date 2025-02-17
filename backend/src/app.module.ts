import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeormModule } from './typeORM/typeorm.module';

@Module({
  imports: [typeormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

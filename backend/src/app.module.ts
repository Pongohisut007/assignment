import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeormModule } from './typeORM/typeorm.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [TypeormModule,GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

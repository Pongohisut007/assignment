import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeormModule } from './typeORM/typeorm.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [typeormModule,GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

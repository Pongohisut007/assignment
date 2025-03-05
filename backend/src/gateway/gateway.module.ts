import { Module, forwardRef } from '@nestjs/common';
import { Gateway } from './gateway';
import { TypeormModule } from '../typeORM/typeorm.module';

@Module({
  imports: [forwardRef(() => TypeormModule)], // ใช้ forwardRef
  providers: [Gateway],
  exports: [],
})
export class GatewayModule {}

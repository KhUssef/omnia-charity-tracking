import { Module } from '@nestjs/common';
import { AidService } from './aid.service';
import { AidController } from './aid.controller';

@Module({
  controllers: [AidController],
  providers: [AidService],
})
export class AidModule {}

import { Module } from '@nestjs/common';
import { AidDistributionService } from './aid-distribution.service';
import { AidDistributionController } from './aid-distribution.controller';

@Module({
  controllers: [AidDistributionController],
  providers: [AidDistributionService],
})
export class AidDistributionModule {}

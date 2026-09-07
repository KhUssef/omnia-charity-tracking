import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceabilityController } from './traceability.controller';
import { TraceabilityService } from './traceability.service';
import { Aid } from '../aid/entities/aid.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aid, AidDistribution])],
  controllers: [TraceabilityController],
  providers: [TraceabilityService],
})
export class TraceabilityModule {}

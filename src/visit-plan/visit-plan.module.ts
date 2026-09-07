import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitPlanController } from './visit-plan.controller';
import { VisitPlanService } from './visit-plan.service';
import { Family } from '../family/entities/family.entity';
import { VulnerabilityModule } from '../vulnerability/vulnerability.module';

@Module({
  imports: [TypeOrmModule.forFeature([Family]), VulnerabilityModule],
  controllers: [VisitPlanController],
  providers: [VisitPlanService],
})
export class VisitPlanModule {}

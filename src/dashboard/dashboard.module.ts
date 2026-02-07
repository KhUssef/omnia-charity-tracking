import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Family } from '../family/entities/family.entity';
import { Visit } from '../visit/entities/visit.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { VisitAidStat } from './entities/visit-aid-stat.entity';
import { Deposit } from '../deposit/entities/deposit.entity';
import { DepositStorageStat } from './entities/deposit-storage-stat.entity';
import { StatsService } from './stats.service';
import { DashboardCronService } from './dashboard-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Family, Visit, AidDistribution, VisitAidStat, Deposit, DepositStorageStat])],
  controllers: [DashboardController],
  providers: [DashboardService, StatsService, DashboardCronService],
  exports: [DashboardService, StatsService],
})
export class DashboardModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidDistributionService } from './aid-distribution.service';
import { AidDistributionController } from './aid-distribution.controller';
import { AidDistribution } from './entities/aid-distribution.entity';
import { Visit } from '../visit/entities/visit.entity';
import { User } from '../user/entities/user.entity';
import { Aid } from '../aid/entities/aid.entity';
import { Deposit } from '../deposit/entities/deposit.entity';
import { DashboardModule } from '../dashboard/dashboard.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AidDistribution, Visit, User, Aid, Deposit]), DashboardModule],
  controllers: [AidDistributionController],
  providers: [AidDistributionService, RolesGuard],
})
export class AidDistributionModule {}

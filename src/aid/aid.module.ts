import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidService } from './aid.service';
import { AidController } from './aid.controller';
import { Aid } from './entities/aid.entity';
import { Deposit } from '../deposit/entities/deposit.entity';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aid, Deposit]), DashboardModule],
  controllers: [AidController],
  providers: [AidService],
})
export class AidModule {}

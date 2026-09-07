import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Family } from '../family/entities/family.entity';
import { Visit } from '../visit/entities/visit.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Family, Visit, AidDistribution, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

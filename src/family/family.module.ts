import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { Family } from './entities/family.entity';
import { FamilyNeed } from './entities/family-need.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Location } from '../location/entities/location.entity';
import { LocationModule } from '../location/location.module';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Family, FamilyNeed, Location, AidDistribution]), LocationModule],
	controllers: [FamilyController],
	providers: [FamilyService, RolesGuard],
})
export class FamilyModule {}

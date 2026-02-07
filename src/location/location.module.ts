import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { CityBoundary } from './entities/city-boundary.entity';
import { Location } from './entities/location.entity';
import { LocationCronService } from './location-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([CityBoundary, Location])],
  controllers: [LocationController],
  providers: [LocationService, LocationCronService],
  exports: [LocationService],
})
export class LocationModule {}

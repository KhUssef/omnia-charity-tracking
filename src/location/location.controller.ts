import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpsertCityBoundaryDto } from './dto/upsert-city-boundary.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }

  @Post('boundaries')
  upsertBoundary(@Body() dto: UpsertCityBoundaryDto) {
    return this.locationService.upsertCityBoundary(dto);
  }

  @Get('boundaries')
  listBoundaries() {
    return this.locationService.listCityBoundaries();
  }

  @Get('boundaries/:city')
  getBoundary(@Param('city') city: string) {
    return this.locationService.getCityBoundary(city);
  }
}

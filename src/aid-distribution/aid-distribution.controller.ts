import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AidDistributionService } from './aid-distribution.service';
import { CreateAidDistributionDto } from './dto/create-aid-distribution.dto';
import { UpdateAidDistributionDto } from './dto/update-aid-distribution.dto';

@Controller('aid-distribution')
export class AidDistributionController {
  constructor(private readonly aidDistributionService: AidDistributionService) {}

  @Post()
  create(@Body() createAidDistributionDto: CreateAidDistributionDto) {
    return this.aidDistributionService.create(createAidDistributionDto);
  }

  @Get()
  findAll() {
    return this.aidDistributionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aidDistributionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAidDistributionDto: UpdateAidDistributionDto) {
    return this.aidDistributionService.update(+id, updateAidDistributionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aidDistributionService.remove(+id);
  }
}

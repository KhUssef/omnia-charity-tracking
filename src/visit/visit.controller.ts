import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Get()
  findAll() {
    return this.visitService.findAll();
  }

  @Get('active')
  findActive(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.visitService.findActive(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.visitService.findUpcoming(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('previous')
  findPrevious(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.visitService.findPrevious(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
	return this.visitService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
	return this.visitService.update(id, updateVisitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
	return this.visitService.remove(id);
  }
}

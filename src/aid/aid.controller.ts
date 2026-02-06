import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AidService } from './aid.service';
import { CreateAidDto } from './dto/create-aid.dto';
import { UpdateAidDto } from './dto/update-aid.dto';

@Controller('aid')
export class AidController {
  constructor(private readonly aidService: AidService) {}

  @Post()
  create(@Body() createAidDto: CreateAidDto) {
    return this.aidService.create(createAidDto);
  }

  @Get()
  findAll() {
    return this.aidService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aidService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAidDto: UpdateAidDto) {
    return this.aidService.update(+id, updateAidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aidService.remove(+id);
  }
}

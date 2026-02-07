import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  create(@Body() dto: CreateDepositDto) {
    return this.depositService.create(dto);
  }

  @Get()
  findAll() {
    return this.depositService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depositService.findOne(id);
  }

  @Get(':id/capacity')
  getCapacity(@Param('id') id: string) {
    return this.depositService.getCapacityStatus(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepositDto) {
    return this.depositService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.depositService.remove(id);
  }
}

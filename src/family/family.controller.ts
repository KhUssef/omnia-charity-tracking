import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User, UserRole } from 'src/user/entities/user.entity';

@Controller('family')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) { }
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  @Post()
  create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.create(createFamilyDto);
  }


  @Get('search/by-lastname')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  searchByLastName(@Query('q') q: string) {
    return this.familyService.searchByLastName(q);
  }

  @Get('search/by-phone')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  searchByPhone(@Query('q') q: string) {
    return this.familyService.searchByPhone(q);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  findOne(@Param('id') id: string) {
    return this.familyService.findOne(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  remove(@Param('id') id: string) {
    return this.familyService.remove(id);
  }
}

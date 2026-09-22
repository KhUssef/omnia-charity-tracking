import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { UpsertFamilyNeedsDto } from './dto/upsert-family-needs.dto';

@Controller('family')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) { }
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  @Post()
  create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.create(createFamilyDto);
  }

  @Get()
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER])
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.familyService.findAll(
      search,
      page ? Number.parseInt(page, 10) : 1,
      limit ? Number.parseInt(limit, 10) : 50,
    );
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

  @Get(':id/needs')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  getNeeds(@Param('id') id: string) {
    return this.familyService.getNeeds(id);
  }

  @Patch(':id/needs')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  upsertNeeds(@Param('id') id: string, @Body() dto: UpsertFamilyNeedsDto) {
    return this.familyService.upsertNeeds(id, dto);
  }

  @Get(':id/aid-recommendation')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  recommendAid(@Param('id') id: string) {
    return this.familyService.recommendAidDistribution(id);
  }

  @Get('needs/catalog/list')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  getNeedCatalog() {
    return this.familyService.getNeedCatalog();
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  remove(@Param('id') id: string) {
    return this.familyService.remove(id);
  }
}

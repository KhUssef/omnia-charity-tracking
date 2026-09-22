import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AidDistributionService } from './aid-distribution.service';
import { CreateAidDistributionDto } from './dto/create-aid-distribution.dto';
import { UpdateAidDistributionDto } from './dto/update-aid-distribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConnectedUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('aid-distribution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AidDistributionController {
  constructor(private readonly aidDistributionService: AidDistributionService) {}

  // Create a distribution: admin assigns to a family, employee uses current visit
  @Post()
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  create(
    @ConnectedUser() user: JwtPayload,
    @Body() createAidDistributionDto: CreateAidDistributionDto,
  ) {
    return this.aidDistributionService.create(user.sub, createAidDistributionDto);
  }

  @Get()
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  findAll() {
    return this.aidDistributionService.findAll();
  }

  // List distributions for the current user's active visit
  @Get('me/current-visit')
  @Roles([UserRole.EMPLOYEE])
  findForCurrentVisit(@ConnectedUser() user: JwtPayload) {
    return this.aidDistributionService.findForCurrentVisit(user.sub);
  }

  // Admin: list distributions for a specific visit
  @Get('by-visit/:visitId')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  findByVisit(@Param('visitId') visitId: string) {
    return this.aidDistributionService.findByVisit(visitId);
  }

  // View a single distribution
  @Get(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  findOne(@Param('id') id: string) {
    return this.aidDistributionService.findOne(id);
  }

  // Update a distribution
  @Patch(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  update(@Param('id') id: string, @Body() updateAidDistributionDto: UpdateAidDistributionDto) {
    return this.aidDistributionService.update(id, updateAidDistributionDto);
  }

  // Soft delete
  @Delete(':id')
  @Roles([UserRole.ADMIN, UserRole.EMPLOYEE])
  remove(@Param('id') id: string) {
    return this.aidDistributionService.softDelete(id);
  }
}

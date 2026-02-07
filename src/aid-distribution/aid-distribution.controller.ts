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

  // Create a distribution for the current user's active visit
  @Post()
  createForCurrentVisit(
    @ConnectedUser() user: JwtPayload,
    @Body() createAidDistributionDto: CreateAidDistributionDto,
  ) {
    return this.aidDistributionService.createForCurrentVisit(user.sub, createAidDistributionDto);
  }

  // List distributions for the current user's active visit
  @Get('me/current-visit')
  findForCurrentVisit(@ConnectedUser() user: JwtPayload) {
    return this.aidDistributionService.findForCurrentVisit(user.sub);
  }

  // Admin: list distributions for a specific visit
  @Get('by-visit/:visitId')
  @Roles(UserRole.ADMIN)
  findByVisit(@Param('visitId') visitId: string) {
    return this.aidDistributionService.findByVisit(visitId);
  }

  // View a single distribution
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aidDistributionService.findOne(id);
  }

  // Update a distribution
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAidDistributionDto: UpdateAidDistributionDto) {
    return this.aidDistributionService.update(id, updateAidDistributionDto);
  }

  // Soft delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aidDistributionService.softDelete(id);
  }
}

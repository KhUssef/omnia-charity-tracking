import { Controller, Get, Query } from '@nestjs/common';
import { VisitPlanService } from './visit-plan.service';

@Controller('visit-plan')
export class VisitPlanController {
  constructor(private readonly visitPlanService: VisitPlanService) {}

  @Get()
  getPlan(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lng ? parseFloat(lng) : undefined;
    return this.visitPlanService.generatePlan(latitude, longitude);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { StatsService } from './stats.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly service: DashboardService,
    private readonly statsService: StatsService,
  ) {}

  // Heatmaps
  @Get('heatmap/families')
  getFamiliesHeatmap() {
    return this.service.familiesHeatmap();
  }

  @Get('heatmap/visits')
  getVisitsHeatmap() {
    return this.service.visitsHeatmap();
  }

  @Get('families/heatmap')
  getRegionalFamilyHeatmap() {
    return this.statsService.getNeedyFamiliesHeatmap();
  }

  @Get('visits/heatmap')
  getVisitRegionHeatmap() {
    return this.statsService.getVisitRegionHeatmap();
  }

  // Cities
  @Get('cities/families')
  getFamiliesByCity() {
    return this.service.familiesByCity();
  }

  @Get('cities/visits')
  getVisitsByCity() {
    return this.service.visitsByCity();
  }

  @Get('cities/aids/heatmap')
  getAidCityHeatmap() {
    return this.service.aidCityHeatmap();
  }

  // Time
  @Get('time/families')
  getFamiliesOverTime(@Query('months') months?: string) {
    const parsed = months ? Number.parseInt(months, 10) : undefined;
    return this.service.familiesOverTime(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('time/visits')
  getVisitsOverTime(@Query('months') months?: string) {
    const parsed = months ? Number.parseInt(months, 10) : undefined;
    return this.service.visitsOverTime(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('time/needy-comparison')
  needyComparison(@Query('months') months?: string) {
    const parsed = months ? Number.parseInt(months, 10) : undefined;
    return this.service.needyComparison(Number.isNaN(parsed) ? undefined : parsed);
  }

  // Aids
  @Get('aids/pie')
  getAidPie(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.service.aidPie(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('aids/city/:city/top/:n')
  getAidTopByCity(@Param('city') city: string, @Param('n') n: string) {
    const parsed = Number.parseInt(n, 10);
    return this.service.topAidByCity(city, Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('aids/frequency')
  getAidFrequency() {
    return this.service.aidFrequency();
  }

  @Get('aids/type-breakdown')
  getAidTypeBreakdown(@Query('region') region?: string, @Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.statsService.getAidTypeBreakdown(region, Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('aids/type-breakdown/by-region')
  getAidTypeBreakdownByRegion(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.statsService.getAidTypeBreakdownByRegion(Number.isNaN(parsed) ? undefined : parsed);
  }

  // Families
  @Get('families/histogram')
  getFamilyHistogram(@Query('months') months?: string) {
    const value = months ? Number.parseInt(months, 10) : undefined;
    return this.statsService.getNeedyFamiliesHistogram(Number.isNaN(value) ? undefined : value);
  }

  @Get('families/size-distribution')
  sizeDistribution() {
    return this.service.familySizeDistribution();
  }

  @Get('families/vulnerability-profile')
  vulnerabilityProfile() {
    return this.service.vulnerabilityProfile();
  }

  // Visits
  @Get('visits/timeline')
  getVisitTimeline(@Query('months') months?: string) {
    const parsed = months ? Number.parseInt(months, 10) : undefined;
    return this.statsService.getVisitTimeline(Number.isNaN(parsed) ? undefined : parsed);
  }

  @Get('visits/completion-rate')
  completionRate() {
    return this.service.completionRate();
  }

  // Deposits
  @Get('deposits/summary')
  getDepositSummary() {
    return this.statsService.getDepositUtilizationSummary();
  }

  @Get('deposits/:id/history')
  getDepositHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.statsService.getDepositHistory(id, Number.isNaN(parsed) ? undefined : parsed);
  }

  // Users
  @Get('users/activity')
  userActivity() {
    return this.service.userActivity();
  }

  // AI
  @Get('ai/risk-map')
  riskMap() {
    return this.service.riskMap();
  }

  @Get('ai/priority-families')
  priorityFamilies(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.service.priorityFamilies(Number.isNaN(parsed) ? undefined : parsed);
  }
}

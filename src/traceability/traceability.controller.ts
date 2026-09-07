import { Controller, Get, Query } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';

@Controller('traceability')
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Get()
  getTraceability(@Query('aidId') aidId?: string) {
    return this.traceabilityService.getTraceability(aidId);
  }
}

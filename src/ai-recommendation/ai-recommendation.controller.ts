import { Controller, Get, Param } from '@nestjs/common';
import { AiRecommendationService } from './ai-recommendation.service';

@Controller('ai-recommendation')
export class AiRecommendationController {
  constructor(private readonly aiService: AiRecommendationService) {}

  @Get(':familyId')
  async getRecommendation(@Param('familyId') familyId: string) {
    return this.aiService.getRecommendations(familyId);
  }
}

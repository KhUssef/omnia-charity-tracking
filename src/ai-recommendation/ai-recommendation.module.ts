import { Module } from '@nestjs/common';
import { AiRecommendationService } from './ai-recommendation.service';
import { AiRecommendationController } from './ai-recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from '../family/entities/family.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Family, AidDistribution])],
  controllers: [AiRecommendationController],
  providers: [AiRecommendationService],
})
export class AiRecommendationModule {}

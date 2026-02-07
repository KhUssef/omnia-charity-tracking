import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../visit/entities/visit.entity';
import { StatsService } from './stats.service';

@Injectable()
export class DashboardCronService {
  private readonly logger = new Logger(DashboardCronService.name);

  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    private readonly statsService: StatsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async rebuildVisitAidStats() {
    const pendingVisits = await this.visitRepo.find({
      where: { isCompleted: true, statsComputed: false },
      select: ['id'],
    });

    if (pendingVisits.length === 0) {
      return;
    }

    this.logger.log(`Recomputing visit aid stats for ${pendingVisits.length} visits`);
    for (const visit of pendingVisits) {
      try {
        await this.statsService.ensureVisitStats(visit.id);
      } catch (error) {
        this.logger.error(`Failed to recompute stats for visit ${visit.id}`, error as Error);
      }
    }
  }
}

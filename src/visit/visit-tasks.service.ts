import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { User } from '../user/entities/user.entity';
import { StatsService } from '../dashboard/stats.service';

@Injectable()
export class VisitTasksService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly statsService: StatsService,
  ) {}

  // Runs every day at midnight server time
  @Cron('0 0 * * *')
  async syncActiveVisits() {
    await this.runSyncActiveVisitsOnce();
  }

  async runSyncActiveVisitsOnce() {
    // Compare by date-only (ignore time of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1) Deactivate visits that are currently marked active but should not be
    const activeVisits = await this.visitRepo.find({
      where: { isActive: true, isCompleted: false },
      relations: ['users', 'users.currentVisit'],
    });

    for (const visit of activeVisits) {
      const shouldDeactivate =
        (visit.endDate && visit.endDate < today) || visit.isCompleted;

      if (shouldDeactivate) {
        visit.isActive = false;
        visit.isCompleted = true;
        visit.statsComputed = false;
        await this.visitRepo.save(visit);
        await this.statsService.ensureVisitStats(visit.id);

        for (const user of visit.users ?? []) {
          if (user.currentVisit && user.currentVisit.id === visit.id) {
            await this.userRepo.update(user.id, { currentVisit: null });
          }
        }
      }
    }

    // 2) Activate visits that should be active by date but are not marked active
    const candidatesToActivate = await this.visitRepo.find({
      where: { isActive: false, isCompleted: false },
      relations: ['users'],
    });

    for (const visit of candidatesToActivate) {
      const shouldActivate =
        visit.startDate <= today && (!visit.endDate || visit.endDate > today);
      console.log(`Visit ${visit.id} shouldActivate=${shouldActivate}`);
      if (!shouldActivate) {
        continue;
      }
      if(visit.users.length === 0){
        visit.isActive = true;
        await this.visitRepo.save(visit);}

      for (const user of visit.users) {
        // Ensure the user has at most one active visit:
        //  - clear active flag on other visits for that user
        const otherActive = await this.visitRepo.find({
          where: { isActive: true, users: { id: user.id } },
        });

        for (const other of otherActive) {
          if (other.id === visit.id) continue;
          other.isActive = false;
          await this.visitRepo.save(other);
        }

        visit.isActive = true;
        await this.visitRepo.save(visit);

        await this.userRepo.update(user.id, { currentVisit: visit });

        if (visit.isCompleted) {
          await this.statsService.ensureVisitStats(visit.id);
        }
      }
    }
  }
}

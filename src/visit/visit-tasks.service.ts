import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class VisitTasksService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Runs every day at midnight server time
  @Cron('0 0 * * *')
  async syncActiveVisits() {
    const now = new Date();

    // 1) Deactivate visits that are currently marked active but should not be
    const activeVisits = await this.visitRepo.find({
      where: { isActive: true, isCompleted: false },
      relations: ['user'],
    });

    for (const visit of activeVisits) {
      const shouldDeactivate =
        (visit.endDate && visit.endDate < now) || visit.isCompleted;

      if (shouldDeactivate) {
        visit.isActive = false;
        visit.isCompleted = true;
        await this.visitRepo.save(visit);

        if (visit.user && visit.user.currentVisit && visit.user.currentVisit.id === visit.id) {
          await this.userRepo.update(visit.user.id, { currentVisit: null });
        }
      }
    }

    // 2) Activate visits that should be active by date but are not marked active
    const candidatesToActivate = await this.visitRepo.find({
      where: { isActive: false, isCompleted: false },
      relations: ['user'],
    });

    for (const visit of candidatesToActivate) {
      const shouldActivate =
        visit.startDate <= now && (!visit.endDate || visit.endDate >= now);

      if (!shouldActivate || !visit.user) continue;

      // Ensure the user has at most one active visit:
      //  - clear active flag on other visits for that user
      const otherActive = await this.visitRepo.find({
        where: { user: { id: visit.user.id }, isActive: true },
      });

      for (const other of otherActive) {
        if (other.id === visit.id) continue;
        other.isActive = false;
        await this.visitRepo.save(other);
      }

      visit.isActive = true;
      await this.visitRepo.save(visit);

      await this.userRepo.update(visit.user.id, { currentVisit: visit });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../family/entities/family.entity';
import { Visit } from '../visit/entities/visit.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(AidDistribution)
    private readonly distributionRepository: Repository<AidDistribution>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSummary() {
    const totalFamilies = await this.familyRepository.count();
    const pendingVisits = await this.visitRepository.count({
      where: { isCompleted: false },
    });
    const activeVisits = await this.visitRepository.count({
      where: { isActive: true, isCompleted: false },
    });
    const totalUsers = await this.userRepository.count();
    const recentDistributions = await this.distributionRepository.find({
      relations: ['aid', 'visit', 'visit.family'],
      order: { date: 'DESC' },
      take: 5,
    });
    return {
      totalFamilies,
      pendingVisits,
      activeVisits,
      totalUsers,
      recentDistributions,
    };
  }
}

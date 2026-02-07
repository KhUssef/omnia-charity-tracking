import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../visit/entities/visit.entity';
import { VisitAidStat } from './entities/visit-aid-stat.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { Aid } from '../aid/entities/aid.entity';
import { AidType } from '../aid/aid.types';
import { Family } from '../family/entities/family.entity';
import { Deposit } from '../deposit/entities/deposit.entity';
import { DepositStorageStat } from './entities/deposit-storage-stat.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(VisitAidStat)
    private readonly visitAidStatRepo: Repository<VisitAidStat>,
    @InjectRepository(AidDistribution)
    private readonly aidDistributionRepo: Repository<AidDistribution>,
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    @InjectRepository(DepositStorageStat)
    private readonly depositStatRepo: Repository<DepositStorageStat>,
  ) {}

  async ensureVisitStats(visitId: string) {
    const visit = await this.visitRepo.findOne({ where: { id: visitId } });
    if (!visit || !visit.isCompleted || visit.statsComputed) {
      return;
    }
    await this.recomputeForVisit(visit);
  }

  async recomputeVisitStats(visitId: string) {
    const visit = await this.visitRepo.findOne({ where: { id: visitId } });
    if (!visit || !visit.isCompleted) {
      return;
    }
    await this.recomputeForVisit(visit);
  }

  private async recomputeForVisit(visit: Visit) {
    const distributions = await this.aidDistributionRepo.find({
      where: { visit: { id: visit.id } },
      relations: ['aid'],
    });

    const totals: Record<string, { quantity: number; count: number }> = {};

    for (const distribution of distributions) {
      const type = distribution.aid?.type ?? AidType.OTHER;
      if (!totals[type]) {
        totals[type] = { quantity: 0, count: 0 };
      }
      totals[type].quantity += distribution.quantity ?? 0;
      totals[type].count += 1;
    }

    await this.visitAidStatRepo.delete({ visit: { id: visit.id } });

    const statEntities = Object.entries(totals).map(([aidType, data]) =>
      this.visitAidStatRepo.create({
        visit,
        aidType: aidType as AidType,
        totalQuantity: data.quantity,
        distributionCount: data.count,
      }),
    );

    if (statEntities.length > 0) {
      await this.visitAidStatRepo.save(statEntities);
    }

    visit.statsComputed = true;
    await this.visitRepo.save(visit);
  }

  async getNeedyFamiliesHeatmap() {
    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .leftJoin('family.location', 'location')
      .select("COALESCE(location.region, 'Unknown')", 'region')
      .addSelect('COUNT(family.id)', 'familyCount')
      .addSelect(
        `SUM(CASE WHEN family.containsDisabledMember = true OR family.containsElderlyMember = true OR family.containspupilMember = true THEN 1 ELSE 0 END)`,
        'needyCount',
      )
      .groupBy('region')
      .getRawMany();

    return rows.map((row) => ({
      region: row.region ?? 'Unknown',
      totalFamilies: Number(row.familyCount) || 0,
      needyFamilies: Number(row.needyCount) || 0,
    }));
  }

  async getNeedyFamiliesHistogram(months = 12) {
    const safeMonths = months && months > 0 ? months : 12;
    const fromDate = new Date();
    fromDate.setDate(1);
    fromDate.setMonth(fromDate.getMonth() - (safeMonths - 1));

    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .select("DATE_FORMAT(family.createdAt, '%Y-%m')", 'bucket')
      .addSelect('COUNT(family.id)', 'familyCount')
      .addSelect(
        `SUM(CASE WHEN family.containsDisabledMember = true OR family.containsElderlyMember = true OR family.containspupilMember = true THEN 1 ELSE 0 END)`,
        'needyCount',
      )
      .where('family.createdAt >= :fromDate', { fromDate })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      bucket: row.bucket,
      totalFamilies: Number(row.familyCount) || 0,
      needyFamilies: Number(row.needyCount) || 0,
    }));
  }

  async getAidTypeBreakdown(region?: string, limit = 5) {
    const qb = this.visitAidStatRepo
      .createQueryBuilder('stat')
      .innerJoin('stat.visit', 'visit')
      .select('stat.aidType', 'aidType')
      .addSelect('SUM(stat.totalQuantity)', 'totalQuantity')
      .addSelect('SUM(stat.distributionCount)', 'distributionCount');

    if (region) {
      qb.where('visit.region = :region', { region });
    }

    const rows = await qb
      .groupBy('stat.aidType')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit ?? 5)
      .getRawMany();

    return rows.map((row) => ({
      aidType: row.aidType as AidType,
      totalQuantity: Number(row.totalQuantity) || 0,
      distributionCount: Number(row.distributionCount) || 0,
    }));
  }

  async getAidTypeBreakdownByRegion(limit = 3) {
    const rows = await this.visitAidStatRepo
      .createQueryBuilder('stat')
      .innerJoin('stat.visit', 'visit')
      .select("COALESCE(visit.region, 'Unknown')", 'region')
      .addSelect('stat.aidType', 'aidType')
      .addSelect('SUM(stat.totalQuantity)', 'totalQuantity')
      .addSelect('SUM(stat.distributionCount)', 'distributionCount')
      .groupBy('region')
      .addGroupBy('stat.aidType')
      .orderBy('region', 'ASC')
      .addOrderBy('totalQuantity', 'DESC')
      .getRawMany();

    const grouped: Record<string, { aidType: AidType; totalQuantity: number; distributionCount: number }[]> = {};
    for (const row of rows) {
      const region = row.region ?? 'Unknown';
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push({
        aidType: row.aidType as AidType,
        totalQuantity: Number(row.totalQuantity) || 0,
        distributionCount: Number(row.distributionCount) || 0,
      });
    }

    return Object.entries(grouped).map(([region, stats]) => ({
      region,
      topAidTypes: stats.slice(0, limit ?? 3),
    }));
  }

  async getVisitRegionHeatmap() {
    const rows = await this.visitRepo
      .createQueryBuilder('visit')
      .select("COALESCE(visit.region, 'Unknown')", 'region')
      .addSelect('COUNT(visit.id)', 'visitCount')
      .addSelect('SUM(CASE WHEN visit.isCompleted = true THEN 1 ELSE 0 END)', 'completedCount')
      .addSelect('SUM(CASE WHEN visit.isActive = true THEN 1 ELSE 0 END)', 'activeCount')
      .groupBy('region')
      .getRawMany();

    return rows.map((row) => ({
      region: row.region ?? 'Unknown',
      totalVisits: Number(row.visitCount) || 0,
      completedVisits: Number(row.completedCount) || 0,
      activeVisits: Number(row.activeCount) || 0,
    }));
  }

  async getVisitTimeline(months = 12) {
    const safeMonths = months && months > 0 ? months : 12;
    const fromDate = new Date();
    fromDate.setDate(1);
    fromDate.setMonth(fromDate.getMonth() - (safeMonths - 1));

    const rows = await this.visitRepo
      .createQueryBuilder('visit')
      .select("DATE_FORMAT(visit.startDate, '%Y-%m')", 'bucket')
      .addSelect('COUNT(visit.id)', 'visitCount')
      .addSelect('SUM(CASE WHEN visit.isCompleted = true THEN 1 ELSE 0 END)', 'completedCount')
      .where('visit.startDate >= :fromDate', { fromDate })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      bucket: row.bucket,
      totalVisits: Number(row.visitCount) || 0,
      completedVisits: Number(row.completedCount) || 0,
    }));
  }

  async recordDepositSnapshot(depositId: string) {
    const deposit = await this.depositRepo.findOne({ where: { id: depositId }, relations: ['aids'] });
    if (!deposit) {
      return;
    }

    const grouped = this.groupAidsByType(deposit.aids ?? []);
    if (grouped.size === 0) {
      grouped.set(AidType.OTHER, 0);
    }

    const stats = Array.from(grouped.entries()).map(([aidType, quantity]) =>
      this.depositStatRepo.create({
        deposit,
        aidType,
        capacity: deposit.capacity,
        storedQuantity: quantity,
      }),
    );

    await this.depositStatRepo.save(stats);
  }

  async getDepositUtilizationSummary() {
    const deposits = await this.depositRepo.find({ order: { name: 'ASC' } });
    return deposits.map((deposit) => ({
      id: deposit.id,
      name: deposit.name,
      city: deposit.city,
      region: deposit.region,
      capacity: deposit.capacity,
      currentQuantity: deposit.currentQuantity,
      utilizationRate: this.calculateUtilization(deposit.capacity, deposit.currentQuantity),
      humidityLevel: deposit.humidityLevel,
      isRefrigerated: deposit.isRefrigerated,
    }));
  }

  async getDepositHistory(depositId: string, limit = 30) {
    await this.ensureDepositExists(depositId);
    const stats = await this.depositStatRepo.find({
      where: { deposit: { id: depositId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return stats.map((stat) => ({
      createdAt: stat.createdAt,
      capacity: stat.capacity,
      aidType: stat.aidType,
      storedQuantity: stat.storedQuantity,
    }));
  }

  private async ensureDepositExists(id: string) {
    const exists = await this.depositRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Deposit not found');
    }
  }

  private calculateUtilization(capacity: number, current: number) {
    if (!capacity || capacity <= 0) {
      return 0;
    }
    return Number((current / capacity).toFixed(3));
  }

  private groupAidsByType(aids: Aid[] = []): Map<AidType, number> {
    const grouped = new Map<AidType, number>();
    for (const aid of aids ?? []) {
      const type = aid?.type ?? AidType.OTHER;
      grouped.set(type, (grouped.get(type) ?? 0) + (aid?.quantity ?? 0));
    }
    return grouped;
  }
}

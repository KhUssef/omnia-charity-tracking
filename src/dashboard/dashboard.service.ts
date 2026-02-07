import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../family/entities/family.entity';
import { Visit } from '../visit/entities/visit.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { AidType } from '../aid/aid.types';
import { VisitAidStat } from './entities/visit-aid-stat.entity';
import { VULNERABILITY_SCORE_SQL, computeVulnerabilityScore } from '../common/vulnerability-score';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const LARGE_FAMILY_THRESHOLD = 6;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(AidDistribution)
    private readonly aidDistributionRepo: Repository<AidDistribution>,
    @InjectRepository(VisitAidStat)
    private readonly visitAidStatRepo: Repository<VisitAidStat>,
  ) {}

  async familiesHeatmap() {
    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .leftJoin('family.location', 'location')
      .select("COALESCE(location.city, 'Unknown')", 'city')
      .addSelect("COALESCE(location.region, 'Unknown')", 'region')
      .addSelect('COUNT(family.id)', 'familyCount')
      .addSelect('SUM(family.vulnerabilityScore)', 'vulnerabilitySum')
      .groupBy('city')
      .addGroupBy('region')
      .orderBy('familyCount', 'DESC')
      .getRawMany();

    return rows.map((row) => {
      const familyCount = Number(row.familyCount) || 0;
      const totalVulnerability = Number(row.vulnerabilitySum) || 0;
      return {
        city: row.city ?? 'Unknown',
        region: row.region ?? 'Unknown',
        familyCount,
        totalVulnerability,
        averageVulnerability: familyCount ? totalVulnerability / familyCount : 0,
      };
    });
  }

  async visitsHeatmap() {
    const rows = await this.visitRepo
      .createQueryBuilder('visit')
      .select("COALESCE(visit.city, 'Unknown')", 'city')
      .addSelect("COALESCE(visit.region, 'Unknown')", 'region')
      .addSelect('COUNT(visit.id)', 'visitCount')
      .addSelect('SUM(CASE WHEN visit.isCompleted = true THEN 1 ELSE 0 END)', 'completedCount')
      .groupBy('city')
      .addGroupBy('region')
      .orderBy('visitCount', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      city: row.city ?? 'Unknown',
      region: row.region ?? 'Unknown',
      visitCount: Number(row.visitCount) || 0,
      completedVisitsCount: Number(row.completedCount) || 0,
    }));
  }


  
  async familiesByCity() {
    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .leftJoin('family.location', 'location')
      .select("COALESCE(location.city, 'Unknown')", 'city')
      .addSelect("COALESCE(location.region, 'Unknown')", 'region')
      .addSelect('COUNT(family.id)', 'familyCount')
      .groupBy('city')
      .addGroupBy('region')
      .orderBy('familyCount', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      city: row.city ?? 'Unknown',
      region: row.region ?? 'Unknown',
      familyCount: Number(row.familyCount) || 0,
    }));
  }

  async visitsByCity() {
    const rows = await this.visitRepo
      .createQueryBuilder('visit')
      .select("COALESCE(visit.city, 'Unknown')", 'city')
      .addSelect("COALESCE(visit.region, 'Unknown')", 'region')
      .addSelect('COUNT(visit.id)', 'visitCount')
      .groupBy('city')
      .addGroupBy('region')
      .orderBy('visitCount', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      city: row.city ?? 'Unknown',
      region: row.region ?? 'Unknown',
      visitCount: Number(row.visitCount) || 0,
    }));
  }

  async aidCityHeatmap() {
    const rows = await this.visitAidStatRepo
      .createQueryBuilder('stat')
      .innerJoin('stat.visit', 'visit')
      .select("COALESCE(visit.city, 'Unknown')", 'city')
      .addSelect("COALESCE(visit.region, 'Unknown')", 'region')
      .addSelect('stat.aidType', 'aidType')
      .addSelect('SUM(stat.totalQuantity)', 'totalQuantity')
      .groupBy('city')
      .addGroupBy('region')
      .addGroupBy('stat.aidType')
      .orderBy('city', 'ASC')
      .addOrderBy('totalQuantity', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      city: row.city ?? 'Unknown',
      region: row.region ?? 'Unknown',
      aidType: row.aidType as AidType,
      totalQuantity: Number(row.totalQuantity) || 0,
    }));
  }

  async familiesOverTime(months?: number) {
    const safeMonths = months && months > 0 ? months : 12;
    const fromDate = this.computeMonthFloor(new Date(), safeMonths);

    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .select("DATE_FORMAT(family.createdAt, '%Y-%m')", 'bucket')
      .addSelect('COUNT(family.id)', 'familyCount')
      .where('family.createdAt >= :fromDate', { fromDate })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      bucket: row.bucket,
      familyCount: Number(row.familyCount) || 0,
    }));
  }

  async visitsOverTime(months?: number) {
    const safeMonths = months && months > 0 ? months : 12;
    const fromDate = this.computeMonthFloor(new Date(), safeMonths);

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
      visitCount: Number(row.visitCount) || 0,
      completedCount: Number(row.completedCount) || 0,
    }));
  }

  async needyComparison(monthWindow?: number) {
    const safeWindow = monthWindow && monthWindow > 0 ? monthWindow : 6;
    const currentRangeStart = this.computeMonthFloor(new Date(), safeWindow);
    const previousRangeStart = this.addMonths(new Date(currentRangeStart), -safeWindow);

    const [previousRange, currentRange] = await Promise.all([
      this.familyRepo
        .createQueryBuilder('family')
        .select(`AVG(${VULNERABILITY_SCORE_SQL})`, 'avgScore')
        .where('family.createdAt >= :prevStart AND family.createdAt < :currStart', {
          prevStart: previousRangeStart,
          currStart: currentRangeStart,
        })
        .getRawOne(),
      this.familyRepo
        .createQueryBuilder('family')
        .select(`AVG(${VULNERABILITY_SCORE_SQL})`, 'avgScore')
        .where('family.createdAt >= :currStart', { currStart: currentRangeStart })
        .getRawOne(),
    ]);

    return {
      windowMonths: safeWindow,
      ranges: [
        {
          label: `${this.formatMonthLabel(previousRangeStart)} - ${this.formatMonthLabel(this.addMonths(currentRangeStart, -1))}`,
          averageVulnerabilityScore: Number(previousRange?.avgScore) || 0,
        },
        {
          label: `${this.formatMonthLabel(currentRangeStart)} - ${this.formatMonthLabel(new Date())}`,
          averageVulnerabilityScore: Number(currentRange?.avgScore) || 0,
        },
      ],
    };
  }

  async aidPie(limit?: number) {
    const rows = await this.visitAidStatRepo
      .createQueryBuilder('stat')
      .select('stat.aidType', 'aidType')
      .addSelect('SUM(stat.totalQuantity)', 'totalQuantity')
      .groupBy('stat.aidType')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit && limit > 0 ? limit : undefined)
      .getRawMany();

    return rows.map((row) => ({
      aidType: row.aidType as AidType,
      totalQuantity: Number(row.totalQuantity) || 0,
    }));
  }

  async topAidByCity(city: string, n?: number) {
    const limit = n && n > 0 ? n : 5;
    const qb = this.visitAidStatRepo
      .createQueryBuilder('stat')
      .innerJoin('stat.visit', 'visit')
      .select('stat.aidType', 'aidType')
      .addSelect('SUM(stat.totalQuantity)', 'totalQuantity')
      .addSelect('SUM(stat.distributionCount)', 'distributionCount')
      .groupBy('stat.aidType')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit);

    if (city && city.toLowerCase() !== 'all') {
      qb.where('visit.city = :city', { city });
    }

    const rows = await qb.getRawMany();

    return rows.map((row) => ({
      aidType: row.aidType as AidType,
      totalQuantity: Number(row.totalQuantity) || 0,
      distributionCount: Number(row.distributionCount) || 0,
    }));
  }

  async aidFrequency() {
    const rows = await this.aidDistributionRepo
      .createQueryBuilder('distribution')
      .innerJoin('distribution.aid', 'aid')
      .select('aid.type', 'aidType')
      .addSelect('COUNT(distribution.id)', 'distributionCount')
      .groupBy('aid.type')
      .orderBy('distributionCount', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      aidType: row.aidType as AidType,
      distributionCount: Number(row.distributionCount) || 0,
    }));
  }

  async familySizeDistribution() {
    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .select('family.numberOfMembers', 'size')
      .addSelect('COUNT(family.id)', 'familyCount')
      .groupBy('family.numberOfMembers')
      .orderBy('family.numberOfMembers', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      size: Number(row.size) || 0,
      familyCount: Number(row.familyCount) || 0,
    }));
  }

  async vulnerabilityProfile() {
    const row = await this.familyRepo
      .createQueryBuilder('family')
      .select('COUNT(family.id)', 'total')
      .addSelect('SUM(CASE WHEN family.containsElderlyMember = true THEN 1 ELSE 0 END)', 'elderlyCount')
      .addSelect('SUM(CASE WHEN family.containsDisabledMember = true THEN 1 ELSE 0 END)', 'disabledCount')
      .addSelect('SUM(CASE WHEN family.containspupilMember = true THEN 1 ELSE 0 END)', 'pupilCount')
      .addSelect(
        'SUM(CASE WHEN family.numberOfMembers >= :threshold THEN 1 ELSE 0 END)',
        'largeFamilyCount',
      )
      .addSelect(`AVG(${VULNERABILITY_SCORE_SQL})`, 'avgScore')
      .setParameter('threshold', LARGE_FAMILY_THRESHOLD)
      .getRawOne();

    const total = Number(row?.total) || 0;

    return {
      elderly: total ? (Number(row?.elderlyCount) || 0) / total : 0,
      disabled: total ? (Number(row?.disabledCount) || 0) / total : 0,
      pupils: total ? (Number(row?.pupilCount) || 0) / total : 0,
      largeFamilies: total ? (Number(row?.largeFamilyCount) || 0) / total : 0,
      povertyScore: Number(row?.avgScore) || 0,
      totals: {
        families: total,
        elderly: Number(row?.elderlyCount) || 0,
        disabled: Number(row?.disabledCount) || 0,
        pupils: Number(row?.pupilCount) || 0,
        largeFamilies: Number(row?.largeFamilyCount) || 0,
      },
    };
  }

  async completionRate() {
    const row = await this.visitRepo
      .createQueryBuilder('visit')
      .select('COUNT(visit.id)', 'total')
      .addSelect('SUM(CASE WHEN visit.isCompleted = true THEN 1 ELSE 0 END)', 'completed')
      .getRawOne();

    const total = Number(row?.total) || 0;
    const completed = Number(row?.completed) || 0;

    return {
      totalVisits: total,
      completedVisits: completed,
      completionRate: total ? completed / total : 0,
    };
  }

  async userActivity() {
    const rows = await this.visitRepo
      .createQueryBuilder('visit')
      .innerJoin('visit.users', 'user')
      .select('user.id', 'userId')
      .addSelect('user.name', 'name')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(DISTINCT visit.id)', 'visitsCount')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.email')
      .orderBy('visitsCount', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      userId: row.userId,
      name: row.name,
      email: row.email,
      visitsCount: Number(row.visitsCount) || 0,
    }));
  }

  async riskMap() {
    const rows = await this.familyRepo
      .createQueryBuilder('family')
      .leftJoin('family.location', 'location')
      .leftJoin('family.visits', 'visit')
      .select('family.id', 'familyId')
      .addSelect('family.numberOfMembers', 'numberOfMembers')
      .addSelect('family.containsDisabledMember', 'containsDisabledMember')
      .addSelect('family.containsElderlyMember', 'containsElderlyMember')
      .addSelect('family.containspupilMember', 'containspupilMember')
      .addSelect('location.latitude', 'latitude')
      .addSelect('location.longitude', 'longitude')
      .addSelect("COALESCE(location.region, 'Unknown')", 'region')
      .addSelect('location.city', 'city')
      .addSelect('MAX(visit.endDate)', 'lastVisitAt')
      .addSelect('COUNT(visit.id)', 'visitCount')
      .where('location.latitude IS NOT NULL')
      .andWhere('location.longitude IS NOT NULL')
      .groupBy('family.id')
      .addGroupBy('location.latitude')
      .addGroupBy('location.longitude')
      .addGroupBy("COALESCE(location.region, 'Unknown')")
      .addGroupBy('location.city')
      .addGroupBy('family.numberOfMembers')
      .addGroupBy('family.containsDisabledMember')
      .addGroupBy('family.containsElderlyMember')
      .addGroupBy('family.containspupilMember')
      .getRawMany();

    const now = Date.now();

    return rows.map((row) => {
      const vulnerabilityScore = computeVulnerabilityScore({
        numberOfMembers: row.numberOfMembers,
        containsDisabledMember: row.containsDisabledMember,
        containsElderlyMember: row.containsElderlyMember,
        containspupilMember: row.containspupilMember,
      });
      const lastVisitAt = row.lastVisitAt ? new Date(row.lastVisitAt) : null;
      const daysSinceLastVisit = lastVisitAt ? (now - lastVisitAt.getTime()) / MS_IN_DAY : null;
      const recencyPenalty = daysSinceLastVisit === null ? 2 : Math.min(2, daysSinceLastVisit / 30);
      const visitCount = Number(row.visitCount) || 0;
      const scarcityPenalty = visitCount === 0 ? 1.5 : Math.min(1.5, 1 / visitCount);
      const riskScore = Number((vulnerabilityScore + recencyPenalty + scarcityPenalty).toFixed(2));

      return {
        familyId: row.familyId,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        region: row.region ?? 'Unknown',
        city: row.city ?? null,
        vulnerabilityScore,
        lastVisitAt: lastVisitAt ? lastVisitAt.toISOString() : null,
        visitCount,
        riskScore,
      };
    });
  }

  async priorityFamilies(limit?: number) {
    const safeLimit = limit && limit > 0 ? limit : 20;
    const points = await this.riskMap();

    return points
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, safeLimit)
      .map((point, index) => ({
        rank: index + 1,
        familyId: point.familyId,
        region: point.region,
        city: point.city,
        latitude: point.latitude,
        longitude: point.longitude,
        vulnerabilityScore: point.vulnerabilityScore,
        riskScore: point.riskScore,
        lastVisitAt: point.lastVisitAt,
      }));
  }

  private computeMonthFloor(current: Date, monthsBack: number) {
    const clone = new Date(current);
    clone.setDate(1);
    clone.setHours(0, 0, 0, 0);
    clone.setMonth(clone.getMonth() - (monthsBack - 1));
    return clone;
  }

  private addMonths(date: Date, diff: number) {
    const clone = new Date(date);
    clone.setMonth(clone.getMonth() + diff);
    return clone;
  }

  private formatMonthLabel(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

}

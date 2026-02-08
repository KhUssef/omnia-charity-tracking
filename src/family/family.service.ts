import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { Family, FamilySelectOptions, FamilySearchSelectOptions } from './entities/family.entity';
import { Location } from '../location/entities/location.entity';
import { LocationService } from '../location/location.service';
import { FamilyNeed, NeedCategory } from './entities/family-need.entity';
import { UpsertFamilyNeedsDto } from './dto/upsert-family-needs.dto';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { AidType } from '../aid/aid.types';

@Injectable()
export class FamilyService {
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(FamilyNeed)
    private readonly familyNeedRepo: Repository<FamilyNeed>,
    @InjectRepository(AidDistribution)
    private readonly aidDistributionRepo: Repository<AidDistribution>,
    private readonly locationService: LocationService,
  ) {}

  async create(createFamilyDto: CreateFamilyDto) {
    const { latitude, longitude, ...familyData } = createFamilyDto;

    const family = this.familyRepo.create(familyData);
    const saved = await this.familyRepo.save(family);

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const { city, region } = await this.locationService.getRegionFromCoordinates(latitude, longitude);

      const location = this.locationRepo.create({
        latitude,
        longitude,
        city,
        region,
        family: saved,
      } as Partial<Location>);

      await this.locationRepo.save(location);
    }

    return this.familyRepo.findOne({
      where: { id: saved.id },
      select: FamilySelectOptions,
    });
  }

  async findAll() {
    return this.familyRepo.find({
      select: FamilySelectOptions,
    });
  }

  async findOne(id: string) {
    const family = await this.familyRepo.findOne({
      where: { id },
      select: FamilySelectOptions,
      relations: ['needs'],
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return family;
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto) {
    const family = await this.familyRepo.findOne({ where: { id } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    const { latitude, longitude, ...rest } = updateFamilyDto;

    Object.assign(family, rest);
    await this.familyRepo.save(family);

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const { city, region } = await this.locationService.getRegionFromCoordinates(
        latitude,
        longitude,
      );

      let location = await this.locationRepo.findOne({
        where: { family: { id: family.id } },
        relations: ['family'],
      });

      if (!location) {
        location = this.locationRepo.create({
          latitude,
          longitude,
          city: city ?? undefined,
          region: region ?? undefined,
          family,
        } as Partial<Location>);
      } else {
        location.latitude = latitude;
        location.longitude = longitude;
        if (city) {
          location.city = city;
        }
        if (region) {
          location.region = region;
        }
      }

      await this.locationRepo.save(location);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const family = await this.familyRepo.findOne({ where: { id } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    await this.familyRepo.softDelete(id);
    return { success: true };
  }

  async searchByLastName(term: string) {
    if (!term?.trim()) {
      return [];
    }
    return this.familyRepo.find({
      where: { lastName: Like(`${term}%`) },
      select: FamilySearchSelectOptions,
    });
  }

  async searchByPhone(term: string) {
    if (!term?.trim()) {
      return [];
    }
    const sanitized = term.replace(/-/g, '');
    return this.familyRepo
      .createQueryBuilder('family')
      .select(['family.id', 'family.lastName', 'family.phone'])
      .where("REPLACE(family.phone, '-', '') LIKE :phone", { phone: `${sanitized}%` })
      .getMany();
  }

  getNeedCatalog() {
    return Object.values(NeedCategory);
  }

  async getNeeds(familyId: string) {
    await this.ensureFamilyExists(familyId);
    return this.familyNeedRepo.find({
      where: { family: { id: familyId } },
      order: { priority: 'DESC', updatedAt: 'DESC' },
    });
  }

  async upsertNeeds(familyId: string, dto: UpsertFamilyNeedsDto) {
    const family = await this.familyRepo.findOne({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    await this.familyNeedRepo.delete({ family: { id: familyId } });
    const needs = dto.needs.map((need) =>
      this.familyNeedRepo.create({
        family,
        category: need.category,
        priority: need.priority,
        notes: need.notes ?? null,
        lastReviewedAt: new Date(),
      }),
    );

    return this.familyNeedRepo.save(needs);
  }

  async recommendAidDistribution(familyId: string) {
    const family = await this.familyRepo.findOne({
      where: { id: familyId },
      relations: ['needs'],
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const needs = family.needs ?? [];
    const distributions = await this.aidDistributionRepo
      .createQueryBuilder('distribution')
      .leftJoinAndSelect('distribution.aid', 'aid')
      .innerJoin('distribution.visit', 'visit')
      .innerJoin('visit.families', 'family', 'family.id = :familyId', { familyId })
      .where('distribution.deletedAt IS NULL')
      .orderBy('distribution.createdAt', 'DESC')
      .limit(120)
      .getMany();

    const historyByType = new Map<AidType, { lastDeliveredAt: Date | null; totalQuantity: number }>();
    for (const record of distributions) {
      const aidType = record.aid?.type ?? AidType.OTHER;
      const snapshot = historyByType.get(aidType) ?? { lastDeliveredAt: null, totalQuantity: 0 };
      snapshot.totalQuantity += record.quantity ?? 0;
      if (!snapshot.lastDeliveredAt || record.createdAt > snapshot.lastDeliveredAt) {
        snapshot.lastDeliveredAt = record.createdAt;
      }
      historyByType.set(aidType, snapshot);
    }

    const recommendationMap = new Map<
      AidType,
      {
        aidType: AidType;
        categories: NeedCategory[];
        priorityScore: number;
        suggestedQuantity: number;
        lastDeliveredDaysAgo: number | null;
      }
    >();

    for (const need of needs) {
      const targetAidTypes = this.resolveAidTypesForNeed(need.category);
      for (const aidType of targetAidTypes) {
        const history = historyByType.get(aidType);
        const daysSince = history?.lastDeliveredAt
          ? Math.floor((Date.now() - history.lastDeliveredAt.getTime()) / FamilyService.MS_PER_DAY)
          : null;
        const suggestedQuantity = this.estimateQuantity(need.priority, history?.totalQuantity);
        const existing = recommendationMap.get(aidType);
        if (existing) {
          existing.priorityScore = Math.max(existing.priorityScore, need.priority);
          existing.suggestedQuantity = Math.max(existing.suggestedQuantity, suggestedQuantity);
          if (!existing.categories.includes(need.category)) {
            existing.categories.push(need.category);
          }
          existing.lastDeliveredDaysAgo = daysSince ?? existing.lastDeliveredDaysAgo;
        } else {
          recommendationMap.set(aidType, {
            aidType,
            categories: [need.category],
            priorityScore: need.priority,
            suggestedQuantity,
            lastDeliveredDaysAgo: daysSince,
          });
        }
      }
    }

    const recommendations = Array.from(recommendationMap.values())
      .map((rec) => ({
        ...rec,
        rationale: this.buildRationale(rec.categories, rec.priorityScore, rec.lastDeliveredDaysAgo),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      familyId,
      generatedAt: new Date().toISOString(),
      needs: needs.map((need) => ({
        id: need.id,
        category: need.category,
        priority: need.priority,
        notes: need.notes,
      })),
      recommendations,
    };
  }

  private resolveAidTypesForNeed(category: NeedCategory): AidType[] {
    switch (category) {
      case NeedCategory.FOOD:
        return [AidType.FOOD];
      case NeedCategory.MEDICAL:
        return [AidType.MEDICINE];
      case NeedCategory.FINANCIAL:
        return [AidType.FINANCIAL];
      case NeedCategory.EDUCATION:
        return [AidType.SOCIAL];
      case NeedCategory.SHELTER:
        return [AidType.OTHER, AidType.FINANCIAL];
      case NeedCategory.EMPLOYMENT:
        return [AidType.OTHER, AidType.SOCIAL];
      case NeedCategory.OTHER:
      default:
        return [AidType.OTHER];
    }
  }

  private estimateQuantity(priority: number, historicalTotal = 0) {
    const base = 20 * priority;
    const adjustment = historicalTotal > 0 ? Math.max(5, 0.2 * historicalTotal) : 10;
    return Math.round(base + adjustment);
  }

  private buildRationale(categories: NeedCategory[], priority: number, daysSince: number | null) {
    const categoryList = categories.join(', ');
    if (daysSince == null) {
      return `${categoryList} need rated ${priority}/5 with no recorded distributions.`;
    }
    return `${categoryList} need rated ${priority}/5; last fulfillment ${daysSince} days ago.`;
  }

  private async ensureFamilyExists(id: string) {
    const exists = await this.familyRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Family not found');
    }
  }
}

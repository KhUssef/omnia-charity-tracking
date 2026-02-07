import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Visit, VisitSelectOptions } from './entities/visit.entity';
import { Family } from '../family/entities/family.entity';
import { LocationService } from '../location/location.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class VisitService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly locationService: LocationService,
  ) {}

  async create(createVisitDto: CreateVisitDto) {
    const { startDate, endDate, latitude, longitude, userIds, ...rest } = createVisitDto;

    // Normalize to date-only (strip time part)
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);

    let normalizedEnd: Date | null = null;
    if (endDate) {
      normalizedEnd = new Date(endDate);
      normalizedEnd.setHours(0, 0, 0, 0);
    }

    const visit = this.visitRepo.create({
      ...rest,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    } as Partial<Visit>);
    
    if (userIds && userIds.length > 0) {
      const users = await this.userRepo.find({ where: { id: In(userIds) } });
      (visit as any).users = users;
    }

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const { city, region } = await this.locationService.getRegionFromCoordinates(latitude, longitude);
      if (city) {
        visit.city = city;
      }
      if (region) {
        visit.region = region;
      }
    }

    const saved = await this.visitRepo.save(visit);
    return this.visitRepo.findOne({
      where: { id: saved.id },
      select: VisitSelectOptions,
    });
  }

  async findAll() {
    return this.visitRepo.find({ select: VisitSelectOptions });
  }

  async findActive() {
    return this.visitRepo.find({
      where: { isActive: true, isCompleted: false },
      select: VisitSelectOptions,
      relations: ['users'],
    });
  }

  async findPrevious(limit: number) {
    return this.visitRepo.find({
      where: { isCompleted: true },
      order: { endDate: 'DESC' },
      take: limit,
      select: VisitSelectOptions,
      relations: ['users'],
    });
  }

  async findOne(id: string) {
    const visit = await this.visitRepo.findOne({
      where: { id },
      select: VisitSelectOptions,
      relations: ['users'],
    });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    const visit = await this.visitRepo.findOne({ where: { id } });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const { latitude, longitude, startDate, endDate, ...rest } = updateVisitDto as any;

    Object.assign(visit, rest);

    // Normalize dates to date-only if provided
    if (startDate) {
      const normalizedStart = new Date(startDate);
      normalizedStart.setHours(0, 0, 0, 0);
      (visit as any).startDate = normalizedStart;
    }

    if (endDate !== undefined) {
      if (endDate === null) {
        (visit as any).endDate = null;
      } else {
        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(0, 0, 0, 0);
        (visit as any).endDate = normalizedEnd;
      }
    }

    if (latitude !== undefined) {
      visit.latitude = latitude;
    }
    if (longitude !== undefined) {
      visit.longitude = longitude;
    }

    if (typeof visit.latitude === 'number' && typeof visit.longitude === 'number') {
      const { city, region } = await this.locationService.getRegionFromCoordinates(visit.latitude, visit.longitude);
      if (city) {
        visit.city = city;
      }
      if (region) {
        visit.region = region;
      }
    }

    await this.visitRepo.save(visit);
    return this.findOne(id);
  }

  async remove(id: string) {
    const visit = await this.visitRepo.findOne({ where: { id } });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    await this.visitRepo.softDelete(id);
    return { success: true };
  }
}

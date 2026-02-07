import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { Family, FamilySelectOptions, FamilySearchSelectOptions } from './entities/family.entity';
import { Location } from '../location/entities/location.entity';
import { LocationService } from '../location/location.service';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
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
    return this.familyRepo.find({
      where: { phone: Like(`${term}%`) },
      select: FamilySearchSelectOptions,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { Family, FamilySelectOptions, FamilySearchSelectOptions } from './entities/family.entity';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
  ) {}

  async create(createFamilyDto: CreateFamilyDto) {
    const family = this.familyRepo.create(createFamilyDto);
    const saved = await this.familyRepo.save(family);
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
    Object.assign(family, updateFamilyDto);
    await this.familyRepo.save(family);
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

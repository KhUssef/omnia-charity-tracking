import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAidDistributionDto } from './dto/create-aid-distribution.dto';
import { UpdateAidDistributionDto } from './dto/update-aid-distribution.dto';
import { AidDistribution, AidDistributionSelectOptions } from './entities/aid-distribution.entity';
import { Visit } from '../visit/entities/visit.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Aid } from '../aid/entities/aid.entity';

@Injectable()
export class AidDistributionService {
  constructor(
    @InjectRepository(AidDistribution)
    private readonly adRepo: Repository<AidDistribution>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Aid)
    private readonly aidRepo: Repository<Aid>,
  ) {}

  private async getUserWithCurrentVisit(userId: string): Promise<{ user: User; visit: Visit }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['currentVisit'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.currentVisit) throw new BadRequestException('User has no current visit');
    return { user, visit: user.currentVisit };
  }

  async createForCurrentVisit(userId: string, dto: CreateAidDistributionDto) {
    const { visit } = await this.getUserWithCurrentVisit(userId);
    const aid = await this.aidRepo.findOne({ where: { id: dto.aidId } });
    if (!aid) throw new NotFoundException('Aid not found');

    const quantity = dto.quantity ?? 1;
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const ad = this.adRepo.create({
      visit,
		// fast UI: allow unit/notes to be null
      quantity,
      unit: dto.unit ?? null,
      notes: dto.notes ?? null,
		// aid relation
		// note: aid is required
		// if future UI allows "quick add" aids, we can relax this
      aid,
    } as Partial<AidDistribution>);

    const saved = await this.adRepo.save(ad);
    return this.adRepo.findOne({
      where: { id: saved.id },
      select: AidDistributionSelectOptions,
    });
  }

  async findOne(id: string) {
    const ad = await this.adRepo.findOne({
      where: { id },
      select: AidDistributionSelectOptions,
      relations: ['visit', 'aid'],
    });
    if (!ad) throw new NotFoundException('Aid distribution not found');
    return ad;
  }

  async findByVisit(visitId: string) {
    return this.adRepo.find({
      where: { visit: { id: visitId } },
      select: AidDistributionSelectOptions,
      relations: ['aid'],
    });
  }

  async findForCurrentVisit(userId: string) {
    const { visit } = await this.getUserWithCurrentVisit(userId);
    return this.findByVisit(visit.id);
  }

  async update(id: string, dto: UpdateAidDistributionDto) {
    const ad = await this.adRepo.findOne({ where: { id }, relations: ['aid'] });
    if (!ad) throw new NotFoundException('Aid distribution not found');

    if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }
      ad.quantity = dto.quantity;
    }
    if (dto.unit !== undefined) ad.unit = dto.unit;
    if (dto.notes !== undefined) ad.notes = dto.notes;
    if ((dto as any).aidId) {
      const aid = await this.aidRepo.findOne({ where: { id: (dto as any).aidId } });
      if (!aid) throw new NotFoundException('Aid not found');
      ad.aid = aid;
    }

    await this.adRepo.save(ad);
    return this.findOne(id);
  }

  async softDelete(id: string) {
    const ad = await this.adRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Aid distribution not found');
    await this.adRepo.softDelete(id);
    return { success: true };
  }
}

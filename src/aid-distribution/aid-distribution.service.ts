import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAidDistributionDto } from './dto/create-aid-distribution.dto';
import { UpdateAidDistributionDto } from './dto/update-aid-distribution.dto';
import { AidDistribution, AidDistributionSelectOptions } from './entities/aid-distribution.entity';
import { Visit } from '../visit/entities/visit.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Aid } from '../aid/entities/aid.entity';
import { Deposit } from '../deposit/entities/deposit.entity';
import { StatsService } from '../dashboard/stats.service';

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
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    private readonly statsService: StatsService,
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

    const quantity = dto.quantity ?? 1;
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const { distributionId, touchedDepositIds } = await this.adRepo.manager.transaction(async (manager) => {
      const adRepo = manager.getRepository(AidDistribution);
      const aidRepo = manager.getRepository(Aid);
      const visitRepo = manager.getRepository(Visit);
      const depositRepo = manager.getRepository(Deposit);

      const visitEntity = await visitRepo.findOne({ where: { id: visit.id } });
      if (!visitEntity) {
        throw new NotFoundException('Visit not found');
      }

      const aid = await aidRepo.findOne({ where: { id: dto.aidId }, relations: ['deposit'] });
      if (!aid) throw new NotFoundException('Aid not found');
      const deposit = this.ensureAidHasDeposit(aid);
      this.validateDepositSupportsAid(aid, deposit);
      this.ensureStockAvailability(aid, deposit, quantity);

      aid.quantity -= quantity;
      await aidRepo.save(aid);

      deposit.currentQuantity -= quantity;
      await depositRepo.save(deposit);

      const ad = adRepo.create({
        visit: visitEntity,
        quantity,
        unit: dto.unit ?? null,
        notes: dto.notes ?? null,
        aid,
        sourceDeposit: deposit,
      } as Partial<AidDistribution>);

      const saved = await adRepo.save(ad);

      if (visitEntity.isCompleted) {
        visitEntity.statsComputed = false;
        await visitRepo.save(visitEntity);
      }

      return { distributionId: saved.id, touchedDepositIds: [deposit.id] };
    });

    await this.refreshDepositStats(touchedDepositIds);

    return this.findOne(distributionId);
  }

  async findOne(id: string) {
    const ad = await this.adRepo.findOne({
      where: { id },
      select: AidDistributionSelectOptions,
      relations: ['visit', 'aid', 'sourceDeposit'],
    });
    if (!ad) throw new NotFoundException('Aid distribution not found');
    return ad;
  }

  async findByVisit(visitId: string) {
    return this.adRepo.find({
      where: { visit: { id: visitId } },
      select: AidDistributionSelectOptions,
      relations: ['aid', 'sourceDeposit'],
    });
  }

  async findForCurrentVisit(userId: string) {
    const { visit } = await this.getUserWithCurrentVisit(userId);
    return this.findByVisit(visit.id);
  }

  async update(id: string, dto: UpdateAidDistributionDto) {
    const { distributionId, touchedDepositIds } = await this.adRepo.manager.transaction(async (manager) => {
      const adRepo = manager.getRepository(AidDistribution);
      const aidRepo = manager.getRepository(Aid);
      const visitRepo = manager.getRepository(Visit);
      const depositRepo = manager.getRepository(Deposit);

      const ad = await adRepo.findOne({ where: { id }, relations: ['aid', 'aid.deposit', 'visit'] });
      if (!ad) throw new NotFoundException('Aid distribution not found');

      const currentAid = ad.aid;
      const currentDeposit = this.ensureAidHasDeposit(currentAid);
      const currentQuantity = ad.quantity;

      const newQuantity = dto.quantity ?? currentQuantity;
      if (newQuantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      let targetAid = currentAid;
      if (dto.aidId && dto.aidId !== currentAid.id) {
        const fetched = await aidRepo.findOne({ where: { id: dto.aidId }, relations: ['deposit'] });
        if (!fetched) throw new NotFoundException('Aid not found');
        targetAid = fetched;
      }

      const targetDeposit = this.ensureAidHasDeposit(targetAid);
      this.validateDepositSupportsAid(targetAid, targetDeposit);

      const touched = new Set<string>();

      if (targetAid.id === currentAid.id) {
        const diff = newQuantity - currentQuantity;
        if (diff !== 0) {
          if (diff > 0) {
            this.ensureStockAvailability(targetAid, targetDeposit, diff);
          }
          targetAid.quantity -= diff;
          await aidRepo.save(targetAid);

          this.applyDepositDelta(targetDeposit, -diff);
          await depositRepo.save(targetDeposit);
          touched.add(targetDeposit.id);
        }
      } else {
        // Return stock to original aid/deposit
        currentAid.quantity += currentQuantity;
        await aidRepo.save(currentAid);
        this.applyDepositDelta(currentDeposit, currentQuantity);
        await depositRepo.save(currentDeposit);
        touched.add(currentDeposit.id);

        this.ensureStockAvailability(targetAid, targetDeposit, newQuantity);
        targetAid.quantity -= newQuantity;
        await aidRepo.save(targetAid);
        this.applyDepositDelta(targetDeposit, -newQuantity);
        await depositRepo.save(targetDeposit);
        touched.add(targetDeposit.id);

        ad.sourceDeposit = targetDeposit;
      }

      ad.quantity = newQuantity;
      if (dto.unit !== undefined) ad.unit = dto.unit;
      if (dto.notes !== undefined) ad.notes = dto.notes;
      ad.aid = targetAid;

      const saved = await adRepo.save(ad);

      if (ad.visit.isCompleted) {
        ad.visit.statsComputed = false;
        await visitRepo.save(ad.visit);
      }

      return { distributionId: saved.id, touchedDepositIds: Array.from(touched) };
    });

    await this.refreshDepositStats(touchedDepositIds);

    return this.findOne(distributionId);
  }

  async softDelete(id: string) {
    const touchedDepositIds = await this.adRepo.manager.transaction(async (manager) => {
      const adRepo = manager.getRepository(AidDistribution);
      const aidRepo = manager.getRepository(Aid);
      const visitRepo = manager.getRepository(Visit);
      const depositRepo = manager.getRepository(Deposit);

      const ad = await adRepo.findOne({ where: { id }, relations: ['aid', 'aid.deposit', 'visit'] });
      if (!ad) throw new NotFoundException('Aid distribution not found');

      ad.aid.quantity += ad.quantity;
      await aidRepo.save(ad.aid);

      const deposit = this.ensureAidHasDeposit(ad.aid);
      this.applyDepositDelta(deposit, ad.quantity);
      await depositRepo.save(deposit);

      await adRepo.softDelete(id);

      if (ad.visit.isCompleted) {
        ad.visit.statsComputed = false;
        await visitRepo.save(ad.visit);
      }
      return [deposit.id];
    });

    await this.refreshDepositStats(touchedDepositIds);

    return { success: true };
  }

  private ensureAidHasDeposit(aid: Aid): Deposit {
    if (!aid.deposit) {
      throw new BadRequestException('Aid is not assigned to a deposit');
    }
    return aid.deposit;
  }

  private validateDepositSupportsAid(aid: Aid, deposit: Deposit) {
    if (aid.requiresRefrigeration && !deposit.isRefrigerated) {
      throw new BadRequestException('Selected deposit lacks refrigeration for this aid');
    }
    if (aid.requiredHumidityLevel && deposit.humidityLevel !== aid.requiredHumidityLevel) {
      throw new BadRequestException('Deposit humidity level is incompatible with this aid');
    }
    if (aid.requiredMinTemperatureC != null) {
      if (deposit.minTemperatureC == null || deposit.minTemperatureC > aid.requiredMinTemperatureC) {
        throw new BadRequestException('Deposit minimum temperature exceeds aid requirement');
      }
    }
    if (aid.requiredMaxTemperatureC != null) {
      if (deposit.maxTemperatureC == null || deposit.maxTemperatureC < aid.requiredMaxTemperatureC) {
        throw new BadRequestException('Deposit maximum temperature is below aid requirement');
      }
    }
  }

  private ensureStockAvailability(aid: Aid, deposit: Deposit, quantity: number) {
    if (aid.quantity < quantity) {
      throw new BadRequestException('Insufficient aid quantity in stock');
    }
    if (deposit.currentQuantity < quantity) {
      throw new BadRequestException('Insufficient quantity in deposit');
    }
  }

  private applyDepositDelta(deposit: Deposit, delta: number) {
    const next = deposit.currentQuantity + delta;
    if (next < 0) {
      throw new BadRequestException('Deposit stock cannot become negative');
    }
    if (next > deposit.capacity) {
      throw new BadRequestException('Deposit capacity exceeded');
    }
    deposit.currentQuantity = next;
  }

  private async refreshDepositStats(depositIds: string[] = []) {
    if (!depositIds || depositIds.length === 0) {
      return;
    }
    const unique = Array.from(new Set(depositIds));
    await Promise.all(unique.map((id) => this.statsService.recordDepositSnapshot(id)));
  }
}

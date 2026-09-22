import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAidDto } from './dto/create-aid.dto';
import { UpdateAidDto } from './dto/update-aid.dto';
import { Aid, AidSelectOptions } from './entities/aid.entity';
import { Deposit, HumidityLevel } from '../deposit/entities/deposit.entity';
import { StatsService } from '../dashboard/stats.service';

@Injectable()
export class AidService {
  constructor(
    @InjectRepository(Aid)
    private readonly aidRepo: Repository<Aid>,
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    private readonly statsService: StatsService,
  ) {}

  async create(dto: CreateAidDto) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException("Le nom de l'aide est obligatoire");
    }
    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;
    const deposit = await this.resolveDeposit(dto.depositId, quantity);
    this.ensureDepositSupportsConstraints(deposit, dto);
    if (deposit.currentQuantity + quantity > deposit.capacity) {
      deposit.capacity = deposit.currentQuantity + quantity;
    }
    const aid = this.aidRepo.create({
      name,
      type: dto.type,
      description: dto.description?.trim() || undefined,
      quantity,
      deposit,
      requiresRefrigeration: dto.requiresRefrigeration ?? false,
      requiredHumidityLevel: dto.requiredHumidityLevel ?? undefined,
      requiredMinTemperatureC: dto.requiredMinTemperatureC ?? undefined,
      requiredMaxTemperatureC: dto.requiredMaxTemperatureC ?? undefined,
    });

    const saved = await this.aidRepo.save(aid);
    await this.applyDepositDelta(deposit, quantity);
    await this.refreshDepositStats([deposit.id]);
    return this.findOne(saved.id);
  }

  async findAll(search?: string) {
    const qb = this.aidRepo
      .createQueryBuilder('aid')
      .leftJoinAndSelect('aid.deposit', 'deposit')
      .select(['aid.id', 'aid.name', 'aid.type', 'aid.quantity', 'aid.description', 'aid.createdAt', 'deposit.id', 'deposit.name']);

    if (search) {
      qb.where('aid.name LIKE :search', { search: `%${search}%` });
    }

    return qb.orderBy('aid.createdAt', 'DESC').take(100).getMany();
  }

  async findOne(id: string) {
    const aid = await this.aidRepo.findOne({
      where: { id },
      select: AidSelectOptions,
      relations: { deposit: true },
      withDeleted: false,
    });
    if (!aid) {
      throw new NotFoundException('Aid not found');
    }
    return aid;
  }

  async update(id: string, dto: UpdateAidDto) {
    const aid = await this.aidRepo.findOne({ where: { id }, relations: ['deposit'] });
    if (!aid) {
      throw new NotFoundException('Aid not found');
    }

    const targetDepositId = dto.depositId ?? aid.deposit?.id;
    if (!targetDepositId) {
      throw new BadRequestException('Aid must belong to a deposit');
    }

    const targetDeposit = await this.getDeposit(targetDepositId);
    const previousDeposit = aid.deposit ? await this.getDeposit(aid.deposit.id) : null;

    const nextQuantity = dto.quantity ?? aid.quantity;
    const nextRequiresRefrigeration = dto.requiresRefrigeration ?? aid.requiresRefrigeration;
    const nextHumidity = dto.requiredHumidityLevel ?? aid.requiredHumidityLevel;
    const nextMinTemp = dto.requiredMinTemperatureC ?? aid.requiredMinTemperatureC;
    const nextMaxTemp = dto.requiredMaxTemperatureC ?? aid.requiredMaxTemperatureC;

    this.ensureDepositSupportsConstraints(targetDeposit, {
      requiresRefrigeration: nextRequiresRefrigeration,
      requiredHumidityLevel: nextHumidity,
      requiredMinTemperatureC: nextMinTemp,
      requiredMaxTemperatureC: nextMaxTemp,
    });

    const touchedDeposits = new Set<string>();

    if (previousDeposit && previousDeposit.id === targetDeposit.id) {
      const diff = nextQuantity - aid.quantity;
      if (diff !== 0) {
        await this.applyDepositDelta(previousDeposit, diff);
        touchedDeposits.add(previousDeposit.id);
      }
    } else {
      if (previousDeposit) {
        await this.applyDepositDelta(previousDeposit, -aid.quantity);
        touchedDeposits.add(previousDeposit.id);
      }
      await this.applyDepositDelta(targetDeposit, nextQuantity);
      touchedDeposits.add(targetDeposit.id);
      aid.deposit = targetDeposit;
    }

    aid.name = dto.name ?? aid.name;
    aid.type = dto.type ?? aid.type;
    aid.description = dto.description ?? aid.description;
    aid.quantity = nextQuantity;
    aid.requiresRefrigeration = nextRequiresRefrigeration;
    aid.requiredHumidityLevel = nextHumidity ?? null;
    aid.requiredMinTemperatureC = nextMinTemp ?? null;
    aid.requiredMaxTemperatureC = nextMaxTemp ?? null;

    await this.aidRepo.save(aid);
    await this.refreshDepositStats(Array.from(touchedDeposits));
    return this.findOne(aid.id);
  }

  async remove(id: string) {
    const aid = await this.aidRepo.findOne({ where: { id }, relations: ['deposit'] });
    if (!aid) {
      throw new NotFoundException('Aid not found');
    }

    const touched: string[] = [];
    if (aid.deposit) {
      await this.applyDepositDelta(aid.deposit, -aid.quantity);
      touched.push(aid.deposit.id);
    }

    await this.aidRepo.softRemove(aid);
    await this.refreshDepositStats(touched);
    return { success: true };
  }

  private async resolveDeposit(depositId: string | undefined, quantity: number) {
    if (depositId) {
      return this.getDeposit(depositId);
    }
    const deposits = await this.depositRepo.find({ order: { name: 'ASC' } });
    const withSpace = deposits.find((d) => d.currentQuantity + quantity <= d.capacity);
    if (withSpace) {
      return withSpace;
    }
    if (deposits[0]) {
      return deposits[0];
    }
    return this.depositRepo.save(
      this.depositRepo.create({
        name: 'Entrepôt principal',
        city: 'Tunis',
        capacity: Math.max(1000, quantity),
        currentQuantity: 0,
        humidityLevel: HumidityLevel.MEDIUM,
      }),
    );
  }

  private async getDeposit(id: string) {
    const deposit = await this.depositRepo.findOne({ where: { id } });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  private ensureDepositSupportsConstraints(
    deposit: Deposit,
    constraints: {
      requiresRefrigeration?: boolean;
      requiredHumidityLevel?: HumidityLevel | null;
      requiredMinTemperatureC?: number | null;
      requiredMaxTemperatureC?: number | null;
    },
  ) {
    if (constraints.requiresRefrigeration && !deposit.isRefrigerated) {
      throw new BadRequestException('Deposit lacks refrigeration to store this aid');
    }
    if (constraints.requiredHumidityLevel && deposit.humidityLevel !== constraints.requiredHumidityLevel) {
      throw new BadRequestException('Deposit humidity level is incompatible');
    }
    if (
      constraints.requiredMinTemperatureC != null &&
      (deposit.minTemperatureC == null || deposit.minTemperatureC > constraints.requiredMinTemperatureC)
    ) {
      throw new BadRequestException('Deposit minimum temperature exceeds aid requirement');
    }
    if (
      constraints.requiredMaxTemperatureC != null &&
      (deposit.maxTemperatureC == null || deposit.maxTemperatureC < constraints.requiredMaxTemperatureC)
    ) {
      throw new BadRequestException('Deposit maximum temperature is below aid requirement');
    }
  }

  private async applyDepositDelta(deposit: Deposit, delta: number) {
    if (delta === 0) {
      return;
    }
    const next = deposit.currentQuantity + delta;
    if (next < 0) {
      throw new BadRequestException('Deposit stock cannot become negative');
    }
    if (next > deposit.capacity) {
      throw new BadRequestException('Deposit capacity exceeded');
    }
    deposit.currentQuantity = next;
    await this.depositRepo.save(deposit);
  }

  private async refreshDepositStats(ids: string[]) {
    if (!ids || ids.length === 0) {
      return;
    }
    const unique = Array.from(new Set(ids));
    await Promise.all(unique.map((id) => this.statsService.recordDepositSnapshot(id)));
  }
}

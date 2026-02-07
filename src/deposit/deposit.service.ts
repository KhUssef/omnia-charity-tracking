import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit } from './entities/deposit.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { StatsService } from '../dashboard/stats.service';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    private readonly statsService: StatsService,
  ) {}

  async create(dto: CreateDepositDto) {
    const deposit = this.depositRepo.create({
      ...dto,
      currentQuantity: dto.currentQuantity ?? 0,
    });
    this.ensureCapacity(deposit.capacity, deposit.currentQuantity);
    this.ensureTemperatureRange(deposit.minTemperatureC, deposit.maxTemperatureC);
    const saved = await this.depositRepo.save(deposit);
    await this.statsService.recordDepositSnapshot(saved.id);
    return saved;
  }

  findAll() {
    return this.depositRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const deposit = await this.depositRepo.findOne({ where: { id } });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  async update(id: string, dto: UpdateDepositDto) {
    const deposit = await this.findOne(id);
    const nextCapacity = dto.capacity ?? deposit.capacity;
    const nextQuantity = dto.currentQuantity ?? deposit.currentQuantity;
    this.ensureCapacity(nextCapacity, nextQuantity);
    this.ensureTemperatureRange(dto.minTemperatureC ?? deposit.minTemperatureC, dto.maxTemperatureC ?? deposit.maxTemperatureC);

    Object.assign(deposit, dto);
    const saved = await this.depositRepo.save(deposit);
    await this.statsService.recordDepositSnapshot(saved.id);
    return saved;
  }

  async remove(id: string) {
    const deposit = await this.findOne(id);
    await this.depositRepo.remove(deposit);
    return { success: true };
  }

  async getCapacityStatus(id: string) {
    const deposit = await this.findOne(id);
    return {
      id: deposit.id,
      capacity: deposit.capacity,
      currentQuantity: deposit.currentQuantity,
      utilizationRate: this.calculateUtilization(deposit.capacity, deposit.currentQuantity),
    };
  }

  private ensureCapacity(capacity: number, current: number) {
    if (capacity <= 0) {
      throw new BadRequestException('Capacity must be greater than zero');
    }
    if (current > capacity) {
      throw new BadRequestException('Current quantity cannot exceed capacity');
    }
    if (current < 0) {
      throw new BadRequestException('Current quantity cannot be negative');
    }
  }

  private ensureTemperatureRange(min?: number | null, max?: number | null) {
    if (min != null && max != null && min > max) {
      throw new BadRequestException('Minimum temperature cannot exceed maximum temperature');
    }
  }

  private calculateUtilization(capacity: number, current: number) {
    if (!capacity || capacity <= 0) {
      return 0;
    }
    return Number((current / capacity).toFixed(3));
  }
}

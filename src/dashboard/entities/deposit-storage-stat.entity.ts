import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deposit } from '../../deposit/entities/deposit.entity';
import { AidType } from '../../aid/aid.types';

@Entity()
@Index('IDX_deposit_stat_deposit', ['deposit', 'aidType', 'createdAt'])
export class DepositStorageStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deposit, (deposit) => deposit.stats, { onDelete: 'CASCADE' })
  deposit: Deposit;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: AidType })
  aidType: AidType;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int' })
  storedQuantity: number;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Aid } from '../../aid/entities/aid.entity';
import { AidDistribution } from '../../aid-distribution/entities/aid-distribution.entity';
import { DepositStorageStat } from '../../dashboard//entities/deposit-storage-stat.entity';

export enum HumidityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity()
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  region: string | null;

  @Column('double precision', { nullable: true })
  latitude: number | null;

  @Column('double precision', { nullable: true })
  longitude: number | null;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentQuantity: number;

  @Column('double precision', { nullable: true })
  minTemperatureC: number | null;

  @Column('double precision', { nullable: true })
  maxTemperatureC: number | null;

  @Column({ type: 'enum', enum: HumidityLevel, default: HumidityLevel.MEDIUM })
  humidityLevel: HumidityLevel;

  @Column({ default: false })
  isRefrigerated: boolean;

  @Column({ type: 'varchar', length: 512, nullable: true })
  containerImageUrl: string | null;

  @OneToMany(() => Aid, (aid) => aid.deposit)
  aids: Aid[];

  @OneToMany(() => AidDistribution, (distribution) => distribution.sourceDeposit)
  distributions: AidDistribution[];

  @OneToMany(() => DepositStorageStat, (stat) => stat.deposit)
  stats: DepositStorageStat[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

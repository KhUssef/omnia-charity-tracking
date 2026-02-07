import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Visit } from '../../visit/entities/visit.entity';
import { AidType } from '../../aid/aid.types';

@Entity()
export class VisitAidStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Visit, (visit) => visit.aidStats, { onDelete: 'CASCADE' })
  visit: Visit;

  @Column({ type: 'enum', enum: AidType })
  aidType: AidType;

  @Column({ type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ type: 'int', default: 0 })
  distributionCount: number;

  @CreateDateColumn()
  createdAt: Date;
}

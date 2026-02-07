import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Family } from './family.entity';

export enum NeedCategory {
  FOOD = 'FOOD',
  SHELTER = 'SHELTER',
  EDUCATION = 'EDUCATION',
  MEDICAL = 'MEDICAL',
  FINANCIAL = 'FINANCIAL',
  EMPLOYMENT = 'EMPLOYMENT',
  OTHER = 'OTHER',
}

@Entity()
export class FamilyNeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Family, (family) => family.needs, { onDelete: 'CASCADE' })
  family: Family;

  @Column({ type: 'enum', enum: NeedCategory })
  category: NeedCategory;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

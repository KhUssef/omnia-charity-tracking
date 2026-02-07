import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import { Family } from '../../family/entities/family.entity';
import { User } from '../../user/entities/user.entity';
import { AidDistribution } from '../../aid-distribution/entities/aid-distribution.entity';


@Entity()
export class Visit {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @CreateDateColumn()
    startDate: Date;

    @CreateDateColumn()
    endDate: Date;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isCompleted: boolean;


    @Column({ type: 'text', nullable: true })
    notes: string;


    @ManyToOne(() => Family, (family) => family.visits)
    family: Family;


    @ManyToOne(() => User, (user) => user.visits)
    user: User;


    @OneToMany(() => AidDistribution, (ad) => ad.visit, { cascade: true })
    aidDistributions: AidDistribution[];

    @DeleteDateColumn()
    deletedAt: Date | null;
}

export const VisitSelectOptions: FindOptionsSelect<Visit> = {
    id: true,
    startDate: true,
    endDate: true,
    isActive: true,
    isCompleted: true,
    notes: true,
    deletedAt: true,
};
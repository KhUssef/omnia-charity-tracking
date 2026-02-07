import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import { Family } from '../../family/entities/family.entity';
import { User } from '../../user/entities/user.entity';
import { AidDistribution } from '../../aid-distribution/entities/aid-distribution.entity';


@Entity()
export class Visit {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column({ type: 'datetime' })
    startDate: Date;

    @Column({ type: 'datetime', nullable: true })
    endDate: Date;

    @Column('double precision', { nullable: true })
    latitude: number | null;

    @Column('double precision', { nullable: true })
    longitude: number | null;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    city: string;



    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isCompleted: boolean;


    @Column({ type: 'text', nullable: true })
    notes: string;

    
    @ManyToMany(() => Family, (family) => family.visits)
    @JoinTable()
    families: Family[];


    @ManyToMany(() => User, (user) => user.visits)
    @JoinTable()
    users: User[];


    @OneToMany(() => AidDistribution, (ad) => ad.visit, { cascade: true })
    aidDistributions: AidDistribution[];

    @DeleteDateColumn()
    deletedAt: Date | null;
}

export const VisitSelectOptions: FindOptionsSelect<Visit> = {
    id: true,
    startDate: true,
    endDate: true,
    latitude: true,
    longitude: true,
    city: true,
    region: true,
    isActive: true,
    isCompleted: true,
    notes: true,
    users:{
        id: true,
        name: true,
        email: true,
    }
};
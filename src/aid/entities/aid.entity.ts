import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AidDistribution } from '../../aid-distribution/entities/aid-distribution.entity';


export enum AidType {
    FOOD = 'FOOD',
    MEDICINE = 'MEDICINE',
    FINANCIAL = 'FINANCIAL',
    SOCIAL = 'SOCIAL',
    OTHER = 'OTHER',
}


@Entity()
export class Aid {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    name: string;


    @Column({ type: 'enum', enum: AidType })
    type: AidType;


    @Column({ nullable: true })
    description: string;


    @OneToMany(() => AidDistribution, (ad) => ad.aid)
    distributions: AidDistribution[];
}
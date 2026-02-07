import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
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
 
    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}

export const AidSelectOptions: FindOptionsSelect<Aid> = {
    id: true,
    name: true,
    type: true,
    description: true,
    createdAt: true,
    deletedAt: true,
};
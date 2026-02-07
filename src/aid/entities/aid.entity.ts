import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import { AidDistribution } from '../../aid-distribution/entities/aid-distribution.entity';
import { Deposit, HumidityLevel } from '../../deposit/entities/deposit.entity';
import { AidType } from '../aid.types';


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

    @Column({ type: 'int', default: 0 })
    quantity: number;


    @Column('double precision', { nullable: true })
    requiredMinTemperatureC: number | null;

    @Column('double precision', { nullable: true })
    requiredMaxTemperatureC: number | null;

    @Column({ type: 'enum', enum: HumidityLevel, nullable: true })
    requiredHumidityLevel: HumidityLevel | null;

    @Column({ default: false })
    requiresRefrigeration: boolean;

    @ManyToOne(() => Deposit, (deposit) => deposit.aids, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'depositId' })
    deposit: Deposit | null;

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
    quantity: true,
    requiredMinTemperatureC: true,
    requiredMaxTemperatureC: true,
    requiredHumidityLevel: true,
    requiresRefrigeration: true,
    createdAt: true,
    deletedAt: true,
    deposit: {
        id: true,
        name: true,
        city: true,
    }
};

export { AidType };
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import { Visit } from '../../visit/entities/visit.entity';
import { Aid } from '../../aid/entities/aid.entity';
import { Deposit } from '../../deposit/entities/deposit.entity';
@Entity()
export class AidDistribution {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    quantity: number;


    @Column({ nullable: true })
    unit: string;


    @Column({ type: 'text', nullable: true })
    notes: string;


    @ManyToOne(() => Visit, (visit) => visit.aidDistributions)
    visit: Visit;


    @ManyToOne(() => Aid, (aid) => aid.distributions)
    aid: Aid;

    @ManyToOne(() => Deposit, (deposit) => deposit.distributions, { nullable: true })
    @JoinColumn({ name: 'sourceDepositId' })
    sourceDeposit: Deposit | null;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}

export const AidDistributionSelectOptions: FindOptionsSelect<AidDistribution> = {
    id: true,
    quantity: true,
    unit: true,
    notes: true,
    createdAt: true,
    deletedAt: true,
    sourceDeposit: {
        id: true,
        name: true,
        city: true,
        region: true,
    }
};
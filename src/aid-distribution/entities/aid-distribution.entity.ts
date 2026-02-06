
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Visit } from '../../visit/entities/visit.entity';
import { Aid } from '../../aid/entities/aid.entity';
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
}
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Visit } from '../../visit/entities/visit.entity';
import { Location } from '../../location/entities/location.entity';

@Entity()
export class Family {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    lastName: string;


    @Column({ nullable: true })
    phone: string;

    @OneToOne(() => Location, (location) => location.family)
    location: Location;

    @Column()
    address: string;


    @Column({ default: 1 })
    numberOfMembers: number;


    @OneToMany(() => Visit, (visit) => visit.family)
    visits: Visit[];

    @Column({default: false})
    containsDisabledMember: boolean;

    @Column({default: false})
    containsElderlyMember: boolean;

    @Column({default: false})
    containspupilMember: boolean;


    
    @Column({ type: 'text', nullable: true })
    notes: string;

}
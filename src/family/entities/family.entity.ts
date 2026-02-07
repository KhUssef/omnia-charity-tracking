import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, DeleteDateColumn, ManyToMany } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
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

    @Column({nullable: true})
    address: string;


    @Column({ default: 1 })
    numberOfMembers: number;
    @ManyToMany(() => Visit, (visit) => visit.families)
    visits: Visit[];

    @Column({default: false})
    containsDisabledMember: boolean;

    @Column({default: false})
    containsElderlyMember: boolean;

    @Column({default: false})
    containspupilMember: boolean;


    
    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

}

export const FamilySelectOptions: FindOptionsSelect<Family> = {
    id: true,
    lastName: true,
    phone: true,
    address: true,
    numberOfMembers: true,
    containsDisabledMember: true,
    containsElderlyMember: true,
    containspupilMember: true,
    createdAt: true,
    deletedAt: true,
};

export const FamilySearchSelectOptions: FindOptionsSelect<Family> = {
	id: true,
	lastName: true,
	phone: true,
};
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, DeleteDateColumn, ManyToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import { Visit } from '../../visit/entities/visit.entity';
import { Location } from '../../location/entities/location.entity';
import { computeVulnerabilityScore } from '../../common/vulnerability-score';

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

    @Column({ type: 'int', default: 0 })
    vulnerabilityScore: number;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @BeforeInsert()
    @BeforeUpdate()
    updateVulnerabilityScore() {
        this.vulnerabilityScore = computeVulnerabilityScore({
            numberOfMembers: this.numberOfMembers,
            containsDisabledMember: this.containsDisabledMember,
            containsElderlyMember: this.containsElderlyMember,
            containspupilMember: this.containspupilMember,
        });
    }

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
    vulnerabilityScore: true,
    createdAt: true,
    deletedAt: true,
};

export const FamilySearchSelectOptions: FindOptionsSelect<Family> = {
	id: true,
	lastName: true,
	phone: true,
};
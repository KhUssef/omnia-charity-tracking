
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Family } from '../../family/entities/family.entity';


@Entity()
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column('double precision')
    latitude: number;


    @Column('double precision')
    longitude: number;


    @Column({ nullable: true })
    city: string;


    @Column({ nullable: true })
    region: string;


    @Column({ nullable: true })
    description: string;


    @OneToOne(() => Family, (family) => family.location)
    @JoinColumn()
    family: Family;
}
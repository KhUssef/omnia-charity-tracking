import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { FindOptionsSelect } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Visit } from '../../visit/entities/visit.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    WORKER = 'WORKER',
}


@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    name: string;


    @Column({ unique: true })
    email: string;


    @Column()
    password: string;


    @Column()
    salt: string;


    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;


    @Column({ nullable: true })
    phone: string;


    @OneToMany(() => Visit, (visit) => visit.user)
    visits: Visit[];

	// Denormalized pointer to the user's current active visit (if any)
	@Column({ type: 'uuid', nullable: true })
	currentVisitId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}


export const UserSelectOptions: FindOptionsSelect<User> = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    currentVisitId: true,
    createdAt: true,
    deletedAt: true,
};
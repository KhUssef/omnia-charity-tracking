# Public Entity Snapshots

Concise TypeORM-style representations of the fields we expose through REST responses. Only the surfaced attributes (per `SelectOptions` or controller returns) are shown; auxiliary columns and decorators are omitted for brevity.

## Visit (dashboard + visit APIs)
```ts
@Entity('visit')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('datetime')
  startDate: Date;

  @Column('datetime', { nullable: true })
  endDate: Date | null;

  @Column('double precision', { nullable: true })
  latitude: number | null;

  @Column('double precision', { nullable: true })
  longitude: number | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  region: string | null;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  statsComputed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToMany(() => User)
  users: Array<Pick<User, 'id' | 'name' | 'email'>>;
}
```

## Family (family APIs)
```ts
@Entity('family')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ default: 1 })
  numberOfMembers: number;

  @Column({ default: false })
  containsDisabledMember: boolean;

  @Column({ default: false })
  containsElderlyMember: boolean;

  @Column({ default: false })
  containspupilMember: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int', default: 0 })
  vulnerabilityScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

`FamilySearchResult` surfaces only `id`, `lastName`, and `phone`.

### FamilyNeed (needs tracker)
```ts
@Entity('family_need')
export class FamilyNeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  family: Family;

  @Column({ type: 'enum', enum: NeedCategory })
  category: NeedCategory;

  @Column({ type: 'int', default: 1 })
  priority: number; // 1-5 scale

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Need catalog exposed via `GET /family/needs/catalog/list` corresponds to the `NeedCategory` enum:
```ts
export enum NeedCategory {
  FOOD = 'FOOD',
  SHELTER = 'SHELTER',
  EDUCATION = 'EDUCATION',
  MEDICAL = 'MEDICAL',
  FINANCIAL = 'FINANCIAL',
  EMPLOYMENT = 'EMPLOYMENT',
  OTHER = 'OTHER',
}
```

## Location (location APIs & nested family location)
```ts
@Entity('location')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  region: string | null;

  @Column({ nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

## Aid (aid APIs, nested in distributions)
```ts
@Entity('aid')
export class Aid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AidType })
  type: AidType;

  @Column({ nullable: true })
  description: string | null;

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

  @ManyToOne(() => Deposit, { nullable: true })
  deposit: Pick<Deposit, 'id' | 'name' | 'city'> | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

## AidDistribution (aid-distribution APIs)
```ts
@Entity('aid_distribution')
export class AidDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  unit: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Visit)
  visit: Visit;

  @ManyToOne(() => Aid)
  aid: Aid;

  @ManyToOne(() => Deposit, { nullable: true })
  sourceDeposit: Pick<Deposit, 'id' | 'name' | 'city' | 'region'> | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

## User (user + auth-adjacent APIs)
```ts
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ default: false })
  isEmailValidated: boolean;

  @ManyToOne(() => Visit, { nullable: true })
  currentVisit: Pick<Visit, 'id'> | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

## Deposit (deposit APIs and nested aid references)
```ts
@Entity('deposit')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  region: string | null;

  @Column('double precision', { nullable: true })
  latitude: number | null;

  @Column('double precision', { nullable: true })
  longitude: number | null;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentQuantity: number;

  @Column('double precision', { nullable: true })
  minTemperatureC: number | null;

  @Column('double precision', { nullable: true })
  maxTemperatureC: number | null;

  @Column({ type: 'enum', enum: HumidityLevel, default: HumidityLevel.MEDIUM })
  humidityLevel: HumidityLevel;

  @Column({ default: false })
  isRefrigerated: boolean;

  @Column({ type: 'varchar', length: 512, nullable: true })
  containerImageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

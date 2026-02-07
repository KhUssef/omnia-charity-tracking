import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity()
@Unique('UQ_city_boundary_name', ['city'])
export class CityBoundary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  city: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  countryCode: string | null;

  @Column({ type: 'json' })
  geojson: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  bbox: [number, number, number, number] | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  externalId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  externalType: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

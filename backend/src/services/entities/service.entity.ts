import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceType {
  NIGHTLY = 'nightly',
  PER_PERSON = 'per_person',
  PER_BOOKING = 'per_booking',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  price: number;

  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.PER_BOOKING,
  })
  type: ServiceType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
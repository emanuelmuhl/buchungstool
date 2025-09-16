import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum GuestType {
  ADULT = 'adult',
  CHILD = 'child',
}

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  nationality: string;

  @Column({
    type: 'enum',
    enum: GuestType,
    default: GuestType.ADULT,
  })
  type: GuestType;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Beziehungen
  @OneToMany(() => Booking, (booking) => booking.primaryGuest)
  bookingsAsPrimary: Booking[];

  @OneToMany(() => Booking, (booking) => booking.additionalGuests)
  bookingsAsAdditional: Booking[];
} 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Guest } from '../../guests/entities/guest.entity';
import { Service } from '../../services/entities/service.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  checkIn: Date;

  @Column({ type: 'date' })
  checkOut: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  totalAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'varchar', length: 3, default: 'CHF' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Beziehungen
  @ManyToOne(() => Guest, (guest) => guest.bookingsAsPrimary)
  primaryGuest: Guest;

  @ManyToMany(() => Guest, (guest) => guest.bookingsAsAdditional)
  @JoinTable({
    name: 'booking_additional_guests',
    joinColumn: { name: 'booking_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'guest_id', referencedColumnName: 'id' },
  })
  additionalGuests: Guest[];

  @ManyToMany(() => Service)
  @JoinTable({
    name: 'booking_services',
    joinColumn: { name: 'booking_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: Service[];
} 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Venue } from './Venue';
import { Event } from './Event';
import { BookedSeat } from './BookedSeat';

export enum SeatStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  BOOKED = 'booked',
}

@Entity('seats')
@Unique(['venueId', 'rowName', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  rowName: string;

  @Column({ type: 'integer' })
  seatNumber: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
  
  @Column({ type: 'boolean', default: false })
  isAccessible: boolean;
  
  @Column({ type: 'varchar', length: 50, nullable: true })
  section: string;

  @ManyToOne(() => Venue, (venue) => venue.seats)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column()
  @Index()
  venueId: string;

  @ManyToOne(() => Event, (event) => event.seats, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  @Index()
  eventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => BookedSeat, (bookedSeat) => bookedSeat.seat)
  bookedSeats: BookedSeat[];

  // Check if the seat is available for booking
  isAvailable(): boolean {
    return this.status === SeatStatus.AVAILABLE && this.isActive;
  }
}

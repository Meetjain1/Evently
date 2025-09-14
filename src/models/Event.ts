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
  VersionColumn,
} from 'typeorm';
import { User } from './User';
import { Venue } from './Venue';
import { Booking } from './Booking';
import { WaitlistEntry } from './WaitlistEntry';
import { Seat } from './Seat';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  @Index()
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  bookedSeats: number;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ticketPrice: number;

  @Column({ type: 'boolean', default: false })
  hasWaitlist: boolean;

  @Column({ type: 'int', default: 0 })
  maxWaitlistSize: number;

  @Column({ type: 'boolean', default: false })
  hasSeating: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => User, (user) => user.createdEvents)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToOne(() => Venue, (venue) => venue.events)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column()
  venueId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Used for optimistic concurrency control
  @VersionColumn()
  version: number;

  // Relations
  @OneToMany(() => Booking, (booking: Booking) => booking.event)
  bookings: Booking[];

  @OneToMany(() => WaitlistEntry, (waitlistEntry: WaitlistEntry) => waitlistEntry.event)
  waitlistEntries: WaitlistEntry[];

  @OneToMany(() => Seat, (seat: Seat) => seat.event)
  seats: Seat[];

  // Check if the event is fully booked
  isFullyBooked(): boolean {
    return this.bookedSeats >= this.capacity;
  }

  // Check if the event is available for booking
  isAvailableForBooking(): boolean {
    return (
      this.status === EventStatus.PUBLISHED &&
      !this.isFullyBooked() &&
      new Date() < this.startDate
    );
  }

  // Check if waitlist is available
  isWaitlistAvailable(): boolean {
    return (
      this.hasWaitlist &&
      this.isFullyBooked() &&
      new Date() < this.startDate
    );
  }
}

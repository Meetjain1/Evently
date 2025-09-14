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
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { BookedSeat } from './BookedSeat';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  numberOfTickets: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'text', nullable: true })
  paymentReference: string;

  @Column({ type: 'timestamp', nullable: true })
  paymentDate: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Event, (event) => event.bookings)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  @Index()
  eventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => BookedSeat, (bookedSeat: BookedSeat) => bookedSeat.booking)
  bookedSeats: BookedSeat[];

  // Calculate total amount based on the number of tickets and event price
  calculateTotalAmount(ticketPrice: number): number {
    return this.numberOfTickets * ticketPrice;
  }
}

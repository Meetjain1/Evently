import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Booking } from './Booking';
import { Seat } from './Seat';

@Entity('booked_seats')
@Unique(['bookingId', 'seatId'])
export class BookedSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.bookedSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  @Index()
  bookingId: string;

  @ManyToOne(() => Seat, (seat) => seat.bookedSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seatId' })
  seat: Seat;

  @Column()
  @Index()
  seatId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

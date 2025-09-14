import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { Booking } from './Booking';
import { WaitlistEntry } from './WaitlistEntry';
import { Event } from './Event';
import { Venue } from './Venue';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('user') // Match the actual table name in MySQL
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => WaitlistEntry, (waitlistEntry) => waitlistEntry.user)
  waitlistEntries: WaitlistEntry[];

  @OneToMany(() => Event, (event) => event.creator)
  createdEvents: Event[];

  @OneToMany(() => Venue, (venue) => venue.creator)
  createdVenues: Venue[];

  // Hash password before inserting
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Check if the provided password is valid
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

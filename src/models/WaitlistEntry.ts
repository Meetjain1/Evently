import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';

export enum WaitlistStatus {
  WAITING = 'waiting',
  NOTIFIED = 'notified',
  BOOKED = 'booked',
  EXPIRED = 'expired',
}

@Entity('waitlist_entries')
@Unique(['userId', 'eventId'])
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WaitlistStatus,
    default: WaitlistStatus.WAITING,
  })
  status: WaitlistStatus;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'integer' })
  numberOfTickets: number;

  @ManyToOne(() => User, (user) => user.waitlistEntries)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Event, (event) => event.waitlistEntries)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  @Index()
  eventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Check if the waitlist entry is still valid
  isValid(): boolean {
    if (this.status !== WaitlistStatus.WAITING) {
      return false;
    }

    const now = new Date();
    // If notified more than 24 hours ago and still in waiting status, consider it expired
    if (this.notifiedAt && (now.getTime() - this.notifiedAt.getTime() > 24 * 60 * 60 * 1000)) {
      return false;
    }

    return true;
  }
}

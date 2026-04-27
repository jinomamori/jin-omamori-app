import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DiningEvent } from './dining-event.entity';
import { User } from './user.entity';

export enum RsvpStatus {
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
}

@Entity('event_rsvps')
@Unique(['eventId', 'userId'])
export class EventRsvp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: RsvpStatus,
  })
  status: RsvpStatus;

  @CreateDateColumn({ name: 'responded_at' })
  respondedAt: Date;

  @ManyToOne(() => DiningEvent, (event) => event.rsvps)
  @JoinColumn({ name: 'event_id' })
  event: DiningEvent;

  @ManyToOne(() => User, (user) => user.eventRsvps)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

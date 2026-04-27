import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EventRsvp } from './event-rsvp.entity';

export enum PlanType {
  GOLD = 'gold',
  VIP = 'vip',
}

@Entity('dining_events')
export class DiningEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    name: 'plan_type',
    type: 'enum',
    enum: PlanType,
  })
  planType: PlanType;

  @Column({ name: 'event_date', type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EventRsvp, (rsvp) => rsvp.event)
  rsvps: EventRsvp[];
}

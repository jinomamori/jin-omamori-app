import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { BenefitUsage } from './benefit-usage.entity';
import { EventRsvp } from './event-rsvp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ name: 'apple_id', type: 'varchar', unique: true, nullable: true })
  appleId: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ name: 'member_number', type: 'varchar', unique: true, nullable: true })
  memberNumber: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => BenefitUsage, (bu) => bu.user)
  benefitUsages: BenefitUsage[];

  @OneToMany(() => EventRsvp, (rsvp) => rsvp.user)
  eventRsvps: EventRsvp[];
}

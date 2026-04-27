import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PartnerStore } from './partner-store.entity';

export enum BenefitType {
  IZAKAYA = 'izakaya',
  YAKINIKU = 'yakiniku',
  PARTNER_STORE = 'partner_store',
}

@Entity('benefit_usage')
export class BenefitUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'benefit_type',
    type: 'enum',
    enum: BenefitType,
  })
  benefitType: BenefitType;

  @Column({ name: 'partner_store_id', type: 'uuid', nullable: true })
  partnerStoreId: string | null;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;

  @Column({ type: 'varchar', length: 7 })
  month: string;

  @ManyToOne(() => User, (user) => user.benefitUsages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PartnerStore, (store) => store.benefitUsages)
  @JoinColumn({ name: 'partner_store_id' })
  partnerStore: PartnerStore | null;
}

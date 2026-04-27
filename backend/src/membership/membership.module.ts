import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { BenefitUsage } from '../database/entities/benefit-usage.entity';
import { User } from '../database/entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BenefitUsage]),
    SubscriptionsModule,
    AuthModule,
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}

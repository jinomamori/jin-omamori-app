import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BenefitUsage,
  BenefitType,
} from '../database/entities/benefit-usage.entity';
import { User } from '../database/entities/user.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlan } from '../database/entities/subscription.entity';
import { UseBenefitDto } from './dto/use-benefit.dto';
import { UsePartnerBenefitDto } from './dto/use-partner-benefit.dto';

/** Plans that are allowed to use each benefit type */
const BENEFIT_PLAN_REQUIREMENTS: Record<BenefitType, SubscriptionPlan[]> = {
  [BenefitType.IZAKAYA]: [SubscriptionPlan.GOLD, SubscriptionPlan.VIP],
  [BenefitType.YAKINIKU]: [SubscriptionPlan.VIP],
  [BenefitType.PARTNER_STORE]: [SubscriptionPlan.STANDARD, SubscriptionPlan.GOLD, SubscriptionPlan.VIP],
};

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(BenefitUsage)
    private readonly benefitUsageRepo: Repository<BenefitUsage>,

    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // ----------------------------------------------------------------
  // GET /api/membership
  // ----------------------------------------------------------------
  async getMembership(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ユーザーが見つかりません');

    const subscription = await this.subscriptionsService.getActiveSubscription(userId);

    const planLabel = subscription
      ? this.planLabel(subscription.plan)
      : 'プランなし';

    // QR code data: JSON string (client renders the actual QR image)
    const qrData = JSON.stringify({
      memberId: user.id,
      memberNumber: user.memberNumber,
      plan: subscription?.plan ?? null,
      issuedAt: new Date().toISOString(),
    });

    return {
      memberNumber: user.memberNumber,
      displayName: user.displayName,
      plan: subscription?.plan ?? null,
      planLabel,
      status: subscription ? 'active' : 'inactive',
      expiresAt: subscription?.expiresAt ?? null,
      qrData,
    };
  }

  // ----------------------------------------------------------------
  // GET /api/benefits/status
  // ----------------------------------------------------------------
  async getBenefitsStatus(userId: string) {
    const subscription = await this.subscriptionsService.getActiveSubscription(userId);
    const currentMonth = this.currentMonthStr();

    const [izakayaUsage, yakinikuUsage, partnerStoreUsage] = await Promise.all([
      this.getMonthUsage(userId, BenefitType.IZAKAYA, currentMonth),
      this.getMonthUsage(userId, BenefitType.YAKINIKU, currentMonth),
      this.getMonthUsage(userId, BenefitType.PARTNER_STORE, currentMonth),
    ]);

    const plan = subscription?.plan ?? null;

    return {
      month: currentMonth,
      plan,
      benefits: {
        izakaya: {
          label: '居酒屋割引（ゴールド以上）',
          available: this.isBenefitAvailable(plan, BenefitType.IZAKAYA),
          usedThisMonth: izakayaUsage,
          limit: 1,
          remaining: Math.max(0, 1 - izakayaUsage),
        },
        yakiniku: {
          label: '焼肉割引（VIPのみ）',
          available: this.isBenefitAvailable(plan, BenefitType.YAKINIKU),
          usedThisMonth: yakinikuUsage,
          limit: 1,
          remaining: Math.max(0, 1 - yakinikuUsage),
        },
        partnerStore: {
          label: '提携店料理1品サービス（スタンダード以上）',
          available: this.isBenefitAvailable(plan, BenefitType.PARTNER_STORE),
          usedThisMonth: partnerStoreUsage,
          limit: 1,
          remaining: Math.max(0, 1 - partnerStoreUsage),
        },
      },
    };
  }

  // ----------------------------------------------------------------
  // POST /api/benefits/use
  // ----------------------------------------------------------------
  async useBenefit(userId: string, dto: UseBenefitDto): Promise<BenefitUsage> {
    const subscription = await this.subscriptionsService.getActiveSubscription(userId);

    if (!subscription) {
      throw new ForbiddenException('有効なサブスクリプションがありません');
    }

    // Plan requirement check
    const requiredPlans = BENEFIT_PLAN_REQUIREMENTS[dto.benefit_type];
    if (!requiredPlans.includes(subscription.plan)) {
      const planName = this.planLabel(subscription.plan);
      const benefitName = dto.benefit_type === BenefitType.IZAKAYA ? '居酒屋特典' : '焼肉特典';
      throw new ForbiddenException(
        `${benefitName}は現在のプラン（${planName}）では利用できません`,
      );
    }

    // Monthly limit check (1 per month)
    const currentMonth = this.currentMonthStr();
    const usedCount = await this.getMonthUsage(userId, dto.benefit_type, currentMonth);
    if (usedCount >= 1) {
      const benefitName = dto.benefit_type === BenefitType.IZAKAYA ? '居酒屋特典' : '焼肉特典';
      throw new ConflictException(
        `${benefitName}は今月（${currentMonth}）すでにご利用済みです。来月以降またご利用ください`,
      );
    }

    // Record usage
    const usage = this.benefitUsageRepo.create({
      userId,
      benefitType: dto.benefit_type,
      month: currentMonth,
    });

    return this.benefitUsageRepo.save(usage);
  }

  // ----------------------------------------------------------------
  // POST /api/benefits/use-partner
  // 提携店で特典利用（月1回制限、partner_store_id記録）
  // ----------------------------------------------------------------
  async usePartnerBenefit(userId: string, dto: UsePartnerBenefitDto): Promise<BenefitUsage> {
    const subscription = await this.subscriptionsService.getActiveSubscription(userId);

    if (!subscription) {
      throw new ForbiddenException('有効なサブスクリプションがありません');
    }

    // Plan requirement check - partner_store benefit is available to all plans
    const requiredPlans = BENEFIT_PLAN_REQUIREMENTS[BenefitType.PARTNER_STORE];
    if (!requiredPlans.includes(subscription.plan)) {
      const planName = this.planLabel(subscription.plan);
      throw new ForbiddenException(
        `提携店特典は現在のプラン（${planName}）では利用できません`,
      );
    }

    // Monthly limit check (1 per month for partner store benefit)
    const currentMonth = this.currentMonthStr();
    const usedCount = await this.getMonthUsage(userId, BenefitType.PARTNER_STORE, currentMonth);
    if (usedCount >= 1) {
      throw new ConflictException(
        `提携店特典は今月（${currentMonth}）すでにご利用済みです。来月以降またご利用ください`,
      );
    }

    // Record usage with partner_store_id
    const usage = this.benefitUsageRepo.create({
      userId,
      benefitType: BenefitType.PARTNER_STORE,
      partnerStoreId: dto.partner_store_id,
      month: currentMonth,
    });

    return this.benefitUsageRepo.save(usage);
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  private currentMonthStr(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // e.g. "2024-06"
  }

  private async getMonthUsage(
    userId: string,
    benefitType: BenefitType,
    month: string,
  ): Promise<number> {
    return this.benefitUsageRepo.count({
      where: { userId, benefitType, month },
    });
  }

  private isBenefitAvailable(plan: SubscriptionPlan | null, benefitType: BenefitType): boolean {
    if (!plan) return false;
    return BENEFIT_PLAN_REQUIREMENTS[benefitType].includes(plan);
  }

  private planLabel(plan: SubscriptionPlan): string {
    const labels: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.STANDARD]: 'スタンダード',
      [SubscriptionPlan.GOLD]: 'ゴールド',
      [SubscriptionPlan.VIP]: 'VIP',
    };
    return labels[plan] ?? plan;
  }
}

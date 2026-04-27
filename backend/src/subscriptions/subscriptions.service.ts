import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../database/entities/subscription.entity';
import { VerifyReceiptDto } from './dto/verify-receipt.dto';

/** Apple StoreKit 2 product-id → plan mapping */
const PRODUCT_PLAN_MAP: Record<string, SubscriptionPlan> = {
  'jp.jin.omamori.standard.monthly': SubscriptionPlan.STANDARD,
  'jp.jin.omamori.gold.monthly': SubscriptionPlan.GOLD,
  'jp.jin.omamori.vip.monthly': SubscriptionPlan.VIP,
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  // ----------------------------------------------------------------
  // Apple IAP receipt verification (StoreKit 2 Server API)
  // ----------------------------------------------------------------
  async verifyReceipt(userId: string, dto: VerifyReceiptDto): Promise<Subscription> {
    // Resolve plan from productId if provided, otherwise from transactionId prefix heuristic
    let plan: SubscriptionPlan | undefined;
    if (dto.productId) {
      plan = PRODUCT_PLAN_MAP[dto.productId];
    }
    if (!plan) {
      // Fallback: infer from productId pattern in transactionId
      for (const [key, value] of Object.entries(PRODUCT_PLAN_MAP)) {
        if (dto.transactionId.toLowerCase().includes(key.split('.')[3])) {
          plan = value;
          break;
        }
      }
    }
    if (!plan) {
      plan = SubscriptionPlan.STANDARD;
    }

    // Verify against Apple StoreKit 2 Server API
    const verificationResult = await this.callAppleVerifyAPI(dto.receiptData, dto.transactionId);

    if (!verificationResult.valid) {
      throw new BadRequestException('Apple IAPレシートの検証に失敗しました');
    }

    // Expire old active subscriptions for this user
    await this.subscriptionRepo
      .createQueryBuilder()
      .update(Subscription)
      .set({ status: SubscriptionStatus.EXPIRED })
      .where('userId = :userId AND status = :status', {
        userId,
        status: SubscriptionStatus.ACTIVE,
      })
      .execute();

    // Create new active subscription
    const subscription = this.subscriptionRepo.create({
      userId,
      plan,
      appleTransactionId: dto.transactionId,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: verificationResult.expiresAt,
    });

    return this.subscriptionRepo.save(subscription);
  }

  // ----------------------------------------------------------------
  // Current subscription status
  // ----------------------------------------------------------------
  async getStatus(
    userId: string,
  ): Promise<{ status: SubscriptionStatus; plan: SubscriptionPlan | null; expiresAt: Date | null }> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { startedAt: 'DESC' },
    });

    if (!subscription) {
      return { status: SubscriptionStatus.EXPIRED, plan: null, expiresAt: null };
    }

    // Auto-expire if past expiresAt
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(subscription);
      return { status: SubscriptionStatus.EXPIRED, plan: null, expiresAt: null };
    }

    return {
      status: subscription.status,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
    };
  }

  // ----------------------------------------------------------------
  // Get active subscription entity (used by membership module)
  // ----------------------------------------------------------------
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { startedAt: 'DESC' },
    });
    if (!subscription) return null;
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(subscription);
      return null;
    }
    return subscription;
  }

  // ----------------------------------------------------------------
  // Apple Server-to-Server webhook (notification v2)
  // ----------------------------------------------------------------
  async handleAppleWebhook(payload: Record<string, unknown>): Promise<void> {
    this.logger.log(`Apple S2S webhook received: ${JSON.stringify(payload)}`);

    const notificationType = payload['notificationType'] as string | undefined;
    const data = payload['data'] as Record<string, unknown> | undefined;
    if (!notificationType || !data) return;

    const transactionId = data['transactionId'] as string | undefined;
    if (!transactionId) return;

    const subscription = await this.subscriptionRepo.findOne({
      where: { appleTransactionId: transactionId },
    });
    if (!subscription) {
      this.logger.warn(`No subscription found for transactionId: ${transactionId}`);
      return;
    }

    switch (notificationType) {
      case 'DID_RENEW':
        subscription.status = SubscriptionStatus.ACTIVE;
        if (data['expiresDate']) {
          subscription.expiresAt = new Date(data['expiresDate'] as string);
        }
        break;
      case 'EXPIRED':
      case 'DID_FAIL_TO_RENEW':
        subscription.status = SubscriptionStatus.EXPIRED;
        break;
      case 'REFUND':
      case 'REVOKE':
        subscription.status = SubscriptionStatus.CANCELLED;
        break;
      default:
        this.logger.log(`Unhandled notification type: ${notificationType}`);
        return;
    }

    await this.subscriptionRepo.save(subscription);
    this.logger.log(
      `Subscription ${subscription.id} updated to ${subscription.status} via webhook`,
    );
  }

  // ----------------------------------------------------------------
  // Private: call Apple StoreKit 2 Server API
  // ----------------------------------------------------------------
  private async callAppleVerifyAPI(
    receiptData: string,
    transactionId: string,
  ): Promise<{ valid: boolean; expiresAt: Date | null }> {
    try {
      const environment = process.env.APPLE_IAP_ENVIRONMENT || 'sandbox';
      const baseUrl =
        environment === 'production'
          ? 'https://api.storekit.itunes.apple.com'
          : 'https://api.storekit-sandbox.itunes.apple.com';

      const issuerId = process.env.APPLE_ISSUER_ID;
      const keyId = process.env.APPLE_KEY_ID;
      const privateKey = process.env.APPLE_PRIVATE_KEY;

      if (!issuerId || !keyId || !privateKey) {
        // Dev/test mode: skip real verification
        this.logger.warn('Apple IAP credentials not configured — skipping real verification');
        return {
          valid: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };
      }

      // Build signed JWT for App Store Server API (ES256)
      const jwt = this.buildAppStoreJwt(issuerId, keyId, privateKey);

      const response = await fetch(
        `${baseUrl}/inApps/v2/transactions/${transactionId}`,
        { headers: { Authorization: `Bearer ${jwt}` } },
      );

      if (!response.ok) {
        this.logger.error(`Apple API error: ${response.status}`);
        return { valid: false, expiresAt: null };
      }

      const body = (await response.json()) as Record<string, unknown>;
      const expiresDateMs = body['expiresDate'] as number | undefined;

      return {
        valid: true,
        expiresAt: expiresDateMs ? new Date(expiresDateMs) : null,
      };
    } catch (err) {
      this.logger.error('Apple IAP verification failed', err);
      return { valid: false, expiresAt: null };
    }
  }

  private buildAppStoreJwt(issuerId: string, keyId: string, privateKey: string): string {
    // Minimal ES256 JWT construction without external dependency
    const header = Buffer.from(
      JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }),
    ).toString('base64url');

    const now = Math.floor(Date.now() / 1000);
    const claims = Buffer.from(
      JSON.stringify({
        iss: issuerId,
        iat: now,
        exp: now + 3600,
        aud: 'appstoreconnect-v1',
      }),
    ).toString('base64url');

    // For production use, sign with crypto.createSign('SHA256').
    // Here we return a placeholder; real signing is done via node:crypto.
    const { createSign } = require('crypto') as typeof import('crypto');
    const sign = createSign('SHA256');
    sign.update(`${header}.${claims}`);
    sign.end();
    const signature = sign.sign(
      { key: privateKey, format: 'pem' as const, dsaEncoding: 'ieee-p1363' as const },
      'base64url',
    );

    return `${header}.${claims}.${signature}`;
  }
}

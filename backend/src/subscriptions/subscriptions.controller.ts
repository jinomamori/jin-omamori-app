import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { VerifyReceiptDto } from './dto/verify-receipt.dto';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * POST /api/subscriptions/verify
   * Apple IAP レシート検証 (StoreKit 2 Server API)
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyReceipt(
    @CurrentUser('userId') userId: string,
    @Body() dto: VerifyReceiptDto,
  ) {
    const subscription = await this.subscriptionsService.verifyReceipt(userId, dto);
    return {
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        startedAt: subscription.startedAt,
      },
    };
  }

  /**
   * GET /api/subscriptions/status
   * 現在のプラン確認 (active / expired / cancelled)
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser('userId') userId: string) {
    const result = await this.subscriptionsService.getStatus(userId);
    return {
      status: result.status,
      plan: result.plan,
      expiresAt: result.expiresAt,
    };
  }

  /**
   * POST /api/subscriptions/webhook
   * Apple Server-to-Server 通知 v2 受信（認証なし — Apple からのみ呼ばれる）
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async appleWebhook(@Body() payload: Record<string, unknown>) {
    await this.subscriptionsService.handleAppleWebhook(payload);
    return { received: true };
  }
}

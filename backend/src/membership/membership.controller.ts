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
import { MembershipService } from './membership.service';
import { UseBenefitDto } from './dto/use-benefit.dto';
import { UsePartnerBenefitDto } from './dto/use-partner-benefit.dto';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  /**
   * GET /api/membership
   * 会員証情報（プラン名、会員番号、QRコード用データ）
   */
  @Get('membership')
  async getMembership(@CurrentUser('userId') userId: string) {
    return this.membershipService.getMembership(userId);
  }

  /**
   * GET /api/benefits/status
   * 今月の特典利用状況
   */
  @Get('benefits/status')
  async getBenefitsStatus(@CurrentUser('userId') userId: string) {
    return this.membershipService.getBenefitsStatus(userId);
  }

  /**
   * POST /api/benefits/use
   * 特典利用記録（月1回制限チェック込み）
   */
  @Post('benefits/use')
  @HttpCode(HttpStatus.CREATED)
  async useBenefit(
    @CurrentUser('userId') userId: string,
    @Body() dto: UseBenefitDto,
  ) {
    const usage = await this.membershipService.useBenefit(userId, dto);
    return {
      success: true,
      usage: {
        id: usage.id,
        benefitType: usage.benefitType,
        month: usage.month,
        usedAt: usage.usedAt,
      },
    };
  }

  /**
   * POST /api/benefits/use-partner
   * 提携店で特典利用（月1回制限、partner_store_id記録）
   */
  @Post('benefits/use-partner')
  @HttpCode(HttpStatus.CREATED)
  async usePartnerBenefit(
    @CurrentUser('userId') userId: string,
    @Body() dto: UsePartnerBenefitDto,
  ) {
    const usage = await this.membershipService.usePartnerBenefit(userId, dto);
    return {
      success: true,
      usage: {
        id: usage.id,
        benefitType: usage.benefitType,
        partnerStoreId: usage.partnerStoreId,
        month: usage.month,
        usedAt: usage.usedAt,
      },
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateOrderDto, PayOrderDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Webhook は JWT 認証不要（Stripe からのリクエスト）
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.ordersService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  payOrder(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: PayOrderDto,
  ) {
    return this.ordersService.payOrder(userId, orderId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.ordersService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    return this.ordersService.findOneByUser(userId, orderId);
  }
}

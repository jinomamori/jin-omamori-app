import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Product } from '../database/entities/product.entity';
import { Subscription, SubscriptionStatus } from '../database/entities/subscription.entity';
import { CreateOrderDto, PayOrderDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly dataSource: DataSource,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-04-30.basil',
    });
  }

  private async checkActiveSubscription(userId: string): Promise<void> {
    const now = new Date();
    const active = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!active) {
      throw new ForbiddenException('グッズ購入にはサブスクリプション登録が必要です');
    }

    if (active.expiresAt && active.expiresAt < now) {
      throw new ForbiddenException('サブスクリプションの有効期限が切れています');
    }
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    await this.checkActiveSubscription(userId);

    return this.dataSource.transaction(async (manager) => {
      let totalPrice = 0;
      const resolvedItems: { product: Product; quantity: number }[] = [];

      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'optimistic', version: undefined },
        });

        if (!product) {
          throw new NotFoundException(`商品が見つかりません: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `在庫が不足しています: ${product.name}（在庫: ${product.stock}、注文: ${item.quantity}）`,
          );
        }

        resolvedItems.push({ product, quantity: item.quantity });
        totalPrice += product.price * item.quantity;
      }

      const order = manager.create(Order, {
        userId,
        totalPrice,
        status: OrderStatus.PENDING,
        shippingAddress: dto.shippingAddress ?? null,
      });
      const savedOrder = await manager.save(order);

      for (const { product, quantity } of resolvedItems) {
        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
        });
        await manager.save(orderItem);

        // 在庫を減らす
        await manager.decrement(Product, { id: product.id }, 'stock', quantity);
      }

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      });
    });
  }

  async payOrder(userId: string, orderId: string, dto: PayOrderDto): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('注文が見つかりません');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('この注文はすでに処理済みです');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: order.totalPrice,
      currency: 'jpy',
      payment_method: dto.paymentMethodId,
      confirm: true,
      return_url: process.env.STRIPE_RETURN_URL || 'https://example.com/return',
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    order.stripePaymentId = paymentIntent.id;

    if (paymentIntent.status === 'succeeded') {
      order.status = OrderStatus.PAID;
    }

    await this.orderRepository.save(order);

    return {
      clientSecret: paymentIntent.client_secret ?? '',
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhookの検証に失敗しました: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await this.orderRepository.update(
          { id: orderId, stripePaymentId: paymentIntent.id },
          { status: OrderStatus.PAID },
        );
      }
    }
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByUser(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('注文が見つかりません');
    }

    return order;
  }
}

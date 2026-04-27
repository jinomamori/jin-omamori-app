import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MembershipModule } from './membership/membership.module';
import { PartnerStoresModule } from './partner-stores/partner-stores.module';
import { EventsModule } from './events/events.module';
import { User } from './database/entities/user.entity';
import { Subscription } from './database/entities/subscription.entity';
import { BenefitUsage } from './database/entities/benefit-usage.entity';
import { Product } from './database/entities/product.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { PartnerStore } from './database/entities/partner-store.entity';
import { DiningEvent } from './database/entities/dining-event.entity';
import { EventRsvp } from './database/entities/event-rsvp.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'jin_user',
      password: process.env.DB_PASSWORD || 'jin_password',
      database: process.env.DB_DATABASE || 'jin_omamori',
      entities: [User, Subscription, BenefitUsage, Product, Order, OrderItem, PartnerStore, DiningEvent, EventRsvp],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    SubscriptionsModule,
    MembershipModule,
    PartnerStoresModule,
    EventsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiningEvent } from '../database/entities/dining-event.entity';
import { EventRsvp } from '../database/entities/event-rsvp.entity';
import { EventsService } from './events.service';
import { EventsController, AdminEventsController } from './events.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiningEvent, EventRsvp]),
    SubscriptionsModule,
  ],
  controllers: [EventsController, AdminEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

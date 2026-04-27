import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiningEvent, PlanType } from '../database/entities/dining-event.entity';
import { EventRsvp, RsvpStatus } from '../database/entities/event-rsvp.entity';
import { User } from '../database/entities/user.entity';
import { SubscriptionPlan } from '../database/entities/subscription.entity';
import { CreateDiningEventDto, UpdateDiningEventDto, CreateRsvpDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(DiningEvent)
    private readonly diningEventRepo: Repository<DiningEvent>,
    @InjectRepository(EventRsvp)
    private readonly eventRsvpRepo: Repository<EventRsvp>,
  ) {}

  // ----------------------------------------------------------------
  // ユーザー用
  // ----------------------------------------------------------------

  async findByUserPlan(user: User, userPlan: SubscriptionPlan | null): Promise<DiningEvent[]> {
    // standardユーザーは空配列を返す
    if (!userPlan || userPlan === SubscriptionPlan.STANDARD) {
      return [];
    }

    const planType = userPlan === SubscriptionPlan.VIP ? PlanType.VIP : PlanType.GOLD;

    return this.diningEventRepo.find({
      where: { planType },
      order: { eventDate: 'ASC' },
    });
  }

  async findOneWithParticipantCount(id: string): Promise<{ event: DiningEvent; participantCount: number }> {
    const event = await this.diningEventRepo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('食事会が見つかりません');
    }

    const participantCount = await this.eventRsvpRepo.count({
      where: { eventId: id, status: RsvpStatus.ATTENDING },
    });

    return { event, participantCount };
  }

  async createRsvp(
    eventId: string,
    userId: string,
    dto: CreateRsvpDto,
  ): Promise<EventRsvp> {
    const event = await this.diningEventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('食事会が見つかりません');
    }

    // 既存のRSVPを確認
    const existingRsvp = await this.eventRsvpRepo.findOne({
      where: { eventId, userId },
    });

    if (existingRsvp) {
      // 更新
      existingRsvp.status = dto.status;
      existingRsvp.respondedAt = new Date();
      return this.eventRsvpRepo.save(existingRsvp);
    }

    // 新規作成
    const rsvp = this.eventRsvpRepo.create({
      eventId,
      userId,
      status: dto.status,
    });

    return this.eventRsvpRepo.save(rsvp);
  }

  // ----------------------------------------------------------------
  // 管理者用
  // ----------------------------------------------------------------

  async findAll(): Promise<DiningEvent[]> {
    return this.diningEventRepo.find({
      order: { eventDate: 'DESC' },
    });
  }

  async create(dto: CreateDiningEventDto): Promise<DiningEvent> {
    const event = this.diningEventRepo.create({
      ...dto,
      eventDate: new Date(dto.eventDate),
    });
    return this.diningEventRepo.save(event);
  }

  async update(id: string, dto: UpdateDiningEventDto): Promise<DiningEvent> {
    const event = await this.diningEventRepo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('食事会が見つかりません');
    }

    Object.assign(event, {
      ...dto,
      ...(dto.eventDate && { eventDate: new Date(dto.eventDate) }),
    });

    return this.diningEventRepo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.diningEventRepo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('食事会が見つかりません');
    }
    await this.diningEventRepo.remove(event);
  }

  async getParticipants(eventId: string): Promise<EventRsvp[]> {
    const event = await this.diningEventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('食事会が見つかりません');
    }

    return this.eventRsvpRepo.find({
      where: { eventId },
      relations: ['user'],
      order: { respondedAt: 'DESC' },
    });
  }
}

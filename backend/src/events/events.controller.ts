import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateDiningEventDto, UpdateDiningEventDto, CreateRsvpDto } from './dto/event.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('api/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * GET /api/events
   * 自分のプランの食事会一覧（standardユーザーは空配列）
   */
  @Get()
  async findAll(@CurrentUser() user: any) {
    const subscription = await this.subscriptionsService.getActiveSubscription(user.userId);
    const events = await this.eventsService.findByUserPlan(user, subscription?.plan ?? null);
    return { events };
  }

  /**
   * GET /api/events/:id
   * 食事会詳細（参加者数表示）
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { event, participantCount } = await this.eventsService.findOneWithParticipantCount(id);
    return { event, participantCount };
  }

  /**
   * POST /api/events/:id/rsvp
   * 参加/不参加を登録
   */
  @Post(':id/rsvp')
  @HttpCode(HttpStatus.CREATED)
  async createRsvp(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateRsvpDto,
  ) {
    const rsvp = await this.eventsService.createRsvp(id, userId, dto);
    return { success: true, rsvp };
  }
}

@Controller('api/admin/events')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * GET /api/admin/events
   * 全食事会一覧（管理者用）
   */
  @Get()
  async findAll() {
    const events = await this.eventsService.findAll();
    return { events };
  }

  /**
   * POST /api/admin/events
   * 食事会作成（管理者）
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDiningEventDto) {
    const event = await this.eventsService.create(dto);
    return { success: true, event };
  }

  /**
   * PUT /api/admin/events/:id
   * 食事会更新（管理者）
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDiningEventDto) {
    const event = await this.eventsService.update(id, dto);
    return { success: true, event };
  }

  /**
   * DELETE /api/admin/events/:id
   * 食事会削除（管理者）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }

  /**
   * GET /api/admin/events/:id/participants
   * 参加者一覧（管理者）
   */
  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    const participants = await this.eventsService.getParticipants(id);
    return { participants };
  }
}

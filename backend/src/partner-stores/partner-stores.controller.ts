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
import { PartnerStoresService } from './partner-stores.service';
import { CreatePartnerStoreDto, UpdatePartnerStoreDto } from './dto/partner-store.dto';

@Controller('api/partner-stores')
@UseGuards(JwtAuthGuard)
export class PartnerStoresController {
  constructor(private readonly partnerStoresService: PartnerStoresService) {}

  /**
   * GET /api/partner-stores
   * 提携店一覧（is_active=trueのみ）
   */
  @Get()
  async findAll() {
    const stores = await this.partnerStoresService.findAllActive();
    return { stores };
  }

  /**
   * GET /api/partner-stores/:id
   * 提携店詳細
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const store = await this.partnerStoresService.findOne(id);
    return { store };
  }
}

@Controller('api/admin/partner-stores')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPartnerStoresController {
  constructor(private readonly partnerStoresService: PartnerStoresService) {}

  /**
   * POST /api/admin/partner-stores
   * 提携店登録（管理者用）
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePartnerStoreDto) {
    const store = await this.partnerStoresService.create(dto);
    return { success: true, store };
  }

  /**
   * PUT /api/admin/partner-stores/:id
   * 提携店更新（管理者用）
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePartnerStoreDto) {
    const store = await this.partnerStoresService.update(id, dto);
    return { success: true, store };
  }

  /**
   * DELETE /api/admin/partner-stores/:id
   * 提携店削除（管理者用）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.partnerStoresService.remove(id);
  }
}

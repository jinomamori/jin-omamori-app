import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerStore } from '../database/entities/partner-store.entity';
import { CreatePartnerStoreDto, UpdatePartnerStoreDto } from './dto/partner-store.dto';

@Injectable()
export class PartnerStoresService {
  constructor(
    @InjectRepository(PartnerStore)
    private readonly partnerStoreRepo: Repository<PartnerStore>,
  ) {}

  async findAllActive(): Promise<PartnerStore[]> {
    return this.partnerStoreRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PartnerStore> {
    const store = await this.partnerStoreRepo.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('提携店が見つかりません');
    }
    return store;
  }

  async create(dto: CreatePartnerStoreDto): Promise<PartnerStore> {
    const store = this.partnerStoreRepo.create(dto);
    return this.partnerStoreRepo.save(store);
  }

  async update(id: string, dto: UpdatePartnerStoreDto): Promise<PartnerStore> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    return this.partnerStoreRepo.save(store);
  }

  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    await this.partnerStoreRepo.remove(store);
  }
}

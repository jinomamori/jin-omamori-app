import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerStore } from '../database/entities/partner-store.entity';
import { PartnerStoresService } from './partner-stores.service';
import { PartnerStoresController, AdminPartnerStoresController } from './partner-stores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerStore])],
  controllers: [PartnerStoresController, AdminPartnerStoresController],
  providers: [PartnerStoresService],
  exports: [PartnerStoresService],
})
export class PartnerStoresModule {}

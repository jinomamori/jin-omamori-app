import { IsUUID } from 'class-validator';

export class UsePartnerBenefitDto {
  @IsUUID()
  partner_store_id: string;
}

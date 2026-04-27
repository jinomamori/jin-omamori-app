import { IsEnum, IsNotEmpty } from 'class-validator';
import { BenefitType } from '../../database/entities/benefit-usage.entity';

export class UseBenefitDto {
  @IsEnum(BenefitType, {
    message: 'benefit_type は izakaya または yakiniku を指定してください',
  })
  @IsNotEmpty()
  benefit_type: BenefitType;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsInt,
} from 'class-validator';

export class CartItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsObject()
  @IsOptional()
  shippingAddress?: Record<string, any>;
}

export class PayOrderDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}

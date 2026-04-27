import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyReceiptDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  receiptData: string;

  @IsString()
  @IsOptional()
  productId?: string;
}

import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { PlanType } from '../../database/entities/dining-event.entity';
import { RsvpStatus } from '../../database/entities/event-rsvp.entity';

export class CreateDiningEventDto {
  @IsString()
  title: string;

  @IsEnum(PlanType)
  planType: PlanType;

  @IsDateString()
  eventDate: string;

  @IsString()
  location: string;

  @IsString()
  address: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}

export class UpdateDiningEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}

export class CreateRsvpDto {
  @IsEnum(RsvpStatus)
  status: RsvpStatus;
}

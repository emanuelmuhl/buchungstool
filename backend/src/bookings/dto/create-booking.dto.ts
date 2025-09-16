import { IsString, IsOptional, IsDateString, IsArray, IsEnum, IsIn, ValidateIf } from 'class-validator';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateBookingDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsString()
  primaryGuestId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalGuestIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @ValidateIf((o) => o.currency !== undefined)
  @IsString()
  currency?: string;
} 
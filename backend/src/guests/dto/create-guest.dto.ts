import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { GuestType } from '../entities/guest.entity';

export class CreateGuestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsEnum(GuestType)
  type?: GuestType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;
} 
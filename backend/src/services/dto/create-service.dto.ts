import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export enum ServiceType {
  NIGHTLY = 'nightly',
  PER_PERSON = 'per_person',
  PER_BOOKING = 'per_booking',
}

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
} 
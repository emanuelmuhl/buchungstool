import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestDto } from './create-guest.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateGuestDto extends PartialType(CreateGuestDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 
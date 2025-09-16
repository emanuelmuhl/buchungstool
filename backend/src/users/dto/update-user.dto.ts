import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsString, MinLength, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword?: string;
}

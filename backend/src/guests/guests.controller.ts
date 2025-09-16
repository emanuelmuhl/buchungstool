import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestsService.create(createGuestDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.guestsService.search(search);
    }
    return this.guestsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.guestsService.findActive();
  }

  @Get('registration/:registrationNumber')
  findByRegistrationNumber(@Param('registrationNumber') registrationNumber: string) {
    return this.guestsService.findByRegistrationNumber(registrationNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.guestsService.update(id, updateGuestDto);
  }

  @Patch(':id/regenerate-registration')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  regenerateRegistrationNumber(@Param('id') id: string) {
    return this.guestsService.regenerateRegistrationNumber(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }
} 
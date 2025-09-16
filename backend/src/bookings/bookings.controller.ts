import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('upcoming')
  findUpcoming() {
    return this.bookingsService.findUpcoming();
  }

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.bookingsService.getDashboardStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: any) {
    console.log('Update booking request:', { id, updateBookingDto });
    try {
      // Whitelist-Validierung - nur erlaubte Felder
      const allowedFields = [
        'checkIn', 'checkOut', 'primaryGuestId', 'additionalGuestIds', 
        'serviceIds', 'notes', 'status', 'currency'
      ];
      
      const filteredDto = {};
      for (const field of allowedFields) {
        if (updateBookingDto[field] !== undefined) {
          filteredDto[field] = updateBookingDto[field];
        }
      }
      
      console.log('Filtered DTO:', filteredDto);
      return this.bookingsService.update(id, filteredDto as UpdateBookingDto);
    } catch (error) {
      console.error('Error in update controller:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
} 
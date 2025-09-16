import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Service } from '../services/entities/service.entity';
import { Guest } from '../guests/entities/guest.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Guest)
    private guestsRepository: Repository<Guest>,
  ) {}

  private calculateTotalAmount(
    checkIn: Date,
    checkOut: Date,
    services: Service[],
    guestCount: number,
    currency: string = 'CHF'
  ): number {
    // Anzahl Nächte berechnen
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalAmount = 0;
    
    // Services durchgehen und Preise berechnen
    for (const service of services) {
      let servicePrice = 0;
      
      switch (service.type) {
        case 'nightly':
          servicePrice = service.price * nights;
          break;
        case 'per_person':
          servicePrice = service.price * guestCount;
          break;
        case 'per_booking':
          servicePrice = service.price;
          break;
      }
      
      totalAmount += servicePrice;
    }
    
    return totalAmount;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Services und Gäste laden
      const services = createBookingDto.serviceIds 
        ? await this.servicesRepository.findBy({ id: In(createBookingDto.serviceIds) })
        : [];
      
      const primaryGuest = await this.guestsRepository.findOne({
        where: { id: createBookingDto.primaryGuestId }
      });
      
      if (!primaryGuest) {
        throw new NotFoundException(`Primary Guest mit ID ${createBookingDto.primaryGuestId} nicht gefunden`);
      }
      
      const additionalGuests = createBookingDto.additionalGuestIds
        ? await this.guestsRepository.findBy({ id: In(createBookingDto.additionalGuestIds) })
        : [];
      
      // Gesamtpreis berechnen
      const guestCount = 1 + additionalGuests.length;
      const totalAmount = this.calculateTotalAmount(
        new Date(createBookingDto.checkIn),
        new Date(createBookingDto.checkOut),
        services,
        guestCount,
        createBookingDto.currency || 'CHF'
      );
      
      const booking = this.bookingsRepository.create({
        ...createBookingDto,
        totalAmount,
        currency: createBookingDto.currency || 'CHF',
        services,
        primaryGuest,
        additionalGuests,
      });
      
      return await this.bookingsRepository.save(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['primaryGuest', 'additionalGuests', 'services'],
      order: { checkIn: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['primaryGuest', 'additionalGuests', 'services'],
    });
    if (!booking) {
      throw new NotFoundException(`Buchung mit ID ${id} nicht gefunden`);
    }
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    try {
      console.log('Updating booking with data:', updateBookingDto);
      console.log('UpdateBookingDto type:', typeof updateBookingDto);
      console.log('UpdateBookingDto keys:', Object.keys(updateBookingDto));
      
      const booking = await this.findOne(id);
      
      // Services und Gäste laden wenn sie aktualisiert werden
      let services = booking.services;
      let additionalGuests = booking.additionalGuests;
      
      if (updateBookingDto.serviceIds) {
        services = await this.servicesRepository.findBy({ id: In(updateBookingDto.serviceIds) });
      }
      
      if (updateBookingDto.additionalGuestIds) {
        additionalGuests = await this.guestsRepository.findBy({ id: In(updateBookingDto.additionalGuestIds) });
      }
      
      // Primary Guest aktualisieren wenn nötig
      let primaryGuest = booking.primaryGuest;
      if (updateBookingDto.primaryGuestId) {
        primaryGuest = await this.guestsRepository.findOne({
          where: { id: updateBookingDto.primaryGuestId }
        });
        if (!primaryGuest) {
          throw new NotFoundException(`Primary Guest mit ID ${updateBookingDto.primaryGuestId} nicht gefunden`);
        }
      }
      
      // Gesamtpreis neu berechnen
      const guestCount = 1 + additionalGuests.length;
      const totalAmount = this.calculateTotalAmount(
        new Date(updateBookingDto.checkIn || booking.checkIn),
        new Date(updateBookingDto.checkOut || booking.checkOut),
        services,
        guestCount,
        updateBookingDto.currency || booking.currency || 'CHF'
      );
      
      // Booking aktualisieren - nur die direkten Felder, nicht die Beziehungen
      const updateData = {
        checkIn: updateBookingDto.checkIn || booking.checkIn,
        checkOut: updateBookingDto.checkOut || booking.checkOut,
        notes: updateBookingDto.notes !== undefined ? updateBookingDto.notes : booking.notes,
        status: updateBookingDto.status || booking.status,
        currency: updateBookingDto.currency || booking.currency,
        totalAmount,
      };
      
      Object.assign(booking, updateData);
      
      // Beziehungen separat setzen
      if (services) booking.services = services;
      if (primaryGuest) booking.primaryGuest = primaryGuest;
      if (additionalGuests) booking.additionalGuests = additionalGuests;
      
      return await this.bookingsRepository.save(booking);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingsRepository.remove(booking);
  }

  async findUpcoming(): Promise<Booking[]> {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return this.bookingsRepository.find({
      where: {
        checkIn: Between(now, nextMonth),
      },
      relations: ['primaryGuest'],
      order: { checkIn: 'ASC' },
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const upcomingBookings = await this.bookingsRepository.count({
      where: {
        checkIn: Between(now, nextMonth),
      },
    });

    const totalBookings = await this.bookingsRepository.count();
    const completedBookings = await this.bookingsRepository.count({
      where: { status: 'completed' as any },
    });

    return {
      upcomingBookings,
      totalBookings,
      completedBookings,
    };
  }
} 
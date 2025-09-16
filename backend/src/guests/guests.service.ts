import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private guestsRepository: Repository<Guest>,
  ) {}

  /**
   * Generiert eine eindeutige Meldescheinnummer
   * Format: RUST-YYYY-XXXX (z.B. RUST-2024-0001)
   */
  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `RUST-${currentYear}`;
    
    // Finde die höchste Nummer für das aktuelle Jahr
    const lastGuest = await this.guestsRepository
      .createQueryBuilder('guest')
      .where('guest.registrationNumber LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('guest.registrationNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastGuest && lastGuest.registrationNumber) {
      const lastNumber = parseInt(lastGuest.registrationNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    try {
      // Meldescheinnummer generieren
      const registrationNumber = await this.generateRegistrationNumber();
      
      const guest = this.guestsRepository.create({
        ...createGuestDto,
        registrationNumber,
      });
      
      return await this.guestsRepository.save(guest);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Ein Gast mit dieser Meldescheinnummer existiert bereits');
      }
      throw error;
    }
  }

  async findAll(): Promise<Guest[]> {
    return this.guestsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Guest[]> {
    return this.guestsRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Guest> {
    const guest = await this.guestsRepository.findOne({
      where: { id },
    });
    if (!guest) {
      throw new NotFoundException(`Gast mit ID ${id} nicht gefunden`);
    }
    return guest;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Guest> {
    const guest = await this.guestsRepository.findOne({
      where: { registrationNumber },
    });
    if (!guest) {
      throw new NotFoundException(`Gast mit Meldescheinnummer ${registrationNumber} nicht gefunden`);
    }
    return guest;
  }

  async update(id: string, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.findOne(id);
    
    // Wenn eine neue Meldescheinnummer gesetzt wird, prüfe auf Eindeutigkeit
    if (updateGuestDto.registrationNumber && updateGuestDto.registrationNumber !== guest.registrationNumber) {
      const existingGuest = await this.guestsRepository.findOne({
        where: { registrationNumber: updateGuestDto.registrationNumber },
      });
      if (existingGuest) {
        throw new ConflictException('Diese Meldescheinnummer wird bereits verwendet');
      }
    }
    
    Object.assign(guest, updateGuestDto);
    return this.guestsRepository.save(guest);
  }

  async remove(id: string): Promise<void> {
    const guest = await this.findOne(id);
    await this.guestsRepository.remove(guest);
  }

  /**
   * Sucht Gäste nach Name oder Meldescheinnummer
   */
  async search(searchTerm: string): Promise<Guest[]> {
    return this.guestsRepository
      .createQueryBuilder('guest')
      .where(
        'guest.firstName ILIKE :searchTerm OR guest.lastName ILIKE :searchTerm OR guest.registrationNumber ILIKE :searchTerm',
        { searchTerm: `%${searchTerm}%` }
      )
      .andWhere('guest.isActive = :isActive', { isActive: true })
      .orderBy('guest.lastName', 'ASC')
      .addOrderBy('guest.firstName', 'ASC')
      .getMany();
  }

  /**
   * Generiert eine neue Meldescheinnummer für einen bestehenden Gast
   */
  async regenerateRegistrationNumber(id: string): Promise<Guest> {
    const guest = await this.findOne(id);
    const newRegistrationNumber = await this.generateRegistrationNumber();
    
    guest.registrationNumber = newRegistrationNumber;
    return this.guestsRepository.save(guest);
  }
} 
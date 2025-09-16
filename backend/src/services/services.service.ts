import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto, ServiceType } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create(createServiceDto);
    return this.servicesRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.servicesRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Leistung mit ID ${id} nicht gefunden`);
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.servicesRepository.remove(service);
  }

  async findActive(): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async initializeDefaultServices(): Promise<void> {
    const existingServices = await this.servicesRepository.count();
    if (existingServices > 0) return;

    const defaultServices = [
      {
        name: 'Übernachtung',
        description: 'Pro Nacht',
        price: 120.00,
                 type: ServiceType.NIGHTLY,
        isActive: true,
        isRequired: true,
        sortOrder: 1,
      },
      {
        name: 'Holz',
        description: 'Holz für Kamin',
        price: 25.00,
                 type: ServiceType.PER_BOOKING,
        isActive: true,
        isRequired: false,
        sortOrder: 2,
      },
      {
        name: 'Kurtaxe',
        description: 'Pro Person pro Nacht',
        price: 3.50,
                 type: ServiceType.PER_PERSON,
        isActive: true,
        isRequired: true,
        sortOrder: 3,
      },
    ];

    for (const serviceData of defaultServices) {
      await this.create(serviceData);
    }
  }
} 
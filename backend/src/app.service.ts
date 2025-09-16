import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    // Standardleistungen und Admin-User initialisieren
    await this.servicesService.initializeDefaultServices();
    await this.usersService.onModuleInit();
  }

  getHello(): string {
    return 'Rustico Buchungstool API läuft!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
} 
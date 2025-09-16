import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServicesService } from './services/services.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly servicesService: ServicesService) {}

  async onModuleInit() {
    // Standardleistungen initialisieren
    await this.servicesService.initializeDefaultServices();
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
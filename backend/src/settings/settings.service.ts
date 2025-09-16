import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadService } from './file-upload.service';
import { Setting } from './entities/setting.entity';

export interface AppSettings {
  companyName: string;
  address: string;
  iban: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  defaultCurrency: string;
  language: string;
  logoUrl?: string;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    private fileUploadService: FileUploadService
  ) {}

  private defaultSettings: AppSettings = {
    companyName: 'Rustico Tessin',
    address: 'Musterstrasse 123, 6500 Bellinzona, Schweiz',
    iban: 'CH93 0076 2011 6238 5295 7',
    phone: '+41 91 123 45 67',
    email: 'info@rustico-tessin.ch',
    website: 'https://rustico-tessin.ch',
    taxNumber: 'CHE-123.456.789',
    defaultCurrency: 'CHF',
    language: 'de',
    logoUrl: null,
  };

  async getSettings(): Promise<AppSettings> {
    try {
      // Lade alle Einstellungen aus der Datenbank
      const settingsFromDb = await this.settingsRepository.find();
      
      // Konvertiere in AppSettings Format
      const settings = { ...this.defaultSettings };
      
      for (const setting of settingsFromDb) {
        if (setting.key in settings) {
          (settings as any)[setting.key] = setting.value;
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error loading settings from database:', error);
      // Fallback zu Standard-Einstellungen
      return this.defaultSettings;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      // Speichere jede Einstellung einzeln in der Datenbank
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== null) {
          await this.settingsRepository.upsert(
            {
              key,
              value: String(value),
            },
            ['key']
          );
        }
      }
      
      // Lade und gebe die aktualisierten Einstellungen zurück
      return await this.getSettings();
    } catch (error) {
      console.error('Error updating settings in database:', error);
      throw new Error('Fehler beim Speichern der Einstellungen');
    }
  }

  async getCompanyInfo() {
    const settings = await this.getSettings();
    return {
      name: settings.companyName,
      address: settings.address,
      iban: settings.iban,
      phone: settings.phone,
      email: settings.email,
      logoUrl: settings.logoUrl,
    };
  }

  async uploadLogo(file: Express.Multer.File): Promise<AppSettings> {
    // Altes Logo löschen falls vorhanden
    if (this.defaultSettings.logoUrl) {
      await this.fileUploadService.deleteLogo(this.defaultSettings.logoUrl);
    }

    // Neues Logo hochladen
    const logoUrl = await this.fileUploadService.uploadLogo(file);
    this.defaultSettings.logoUrl = logoUrl;

    return this.defaultSettings;
  }

  async deleteLogo(): Promise<AppSettings> {
    if (this.defaultSettings.logoUrl) {
      await this.fileUploadService.deleteLogo(this.defaultSettings.logoUrl);
      this.defaultSettings.logoUrl = null;
    }

    return this.defaultSettings;
  }
} 
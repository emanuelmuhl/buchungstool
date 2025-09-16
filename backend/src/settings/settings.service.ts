import { Injectable } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

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
  constructor(private fileUploadService: FileUploadService) {}

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
    // In einer echten App würden diese aus der Datenbank geladen
    // Für jetzt verwenden wir die Standardeinstellungen
    return this.defaultSettings;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    // In einer echten App würden diese in der Datenbank gespeichert
    this.defaultSettings = { ...this.defaultSettings, ...settings };
    return this.defaultSettings;
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
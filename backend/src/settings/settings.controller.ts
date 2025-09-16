import { Controller, Get, Put, Body, UseGuards, Post, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService, AppSettings } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() settings: Partial<AppSettings>) {
    return this.settingsService.updateSettings(settings);
  }

  @Get('company-info')
  getCompanyInfo() {
    return this.settingsService.getCompanyInfo();
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.settingsService.uploadLogo(file);
  }

  @Delete('logo')
  deleteLogo() {
    return this.settingsService.deleteLogo();
  }
} 
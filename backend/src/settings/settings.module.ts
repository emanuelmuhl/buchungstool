import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined, // Verwendet Memory Storage für Buffer
    }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, FileUploadService],
  exports: [SettingsService],
})
export class SettingsModule {} 
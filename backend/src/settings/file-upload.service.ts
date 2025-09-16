import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FileUploadService {
  private uploadsDir = join(process.cwd(), 'uploads');

  async uploadLogo(file: Express.Multer.File): Promise<string> {
    // Uploads-Verzeichnis erstellen falls nicht vorhanden
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true });
    }

    // Dateiname generieren
    const timestamp = Date.now();
    const fileName = `logo-${timestamp}.${this.getFileExtension(file.originalname)}`;
    const filePath = join(this.uploadsDir, fileName);

    // Datei speichern
    await writeFile(filePath, file.buffer);

    // URL zurückgeben
    return `/uploads/${fileName}`;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'png';
  }

  async deleteLogo(logoUrl: string): Promise<void> {
    if (logoUrl && logoUrl.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), logoUrl);
      try {
        await writeFile(filePath, ''); // Datei leeren
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }
  }
} 
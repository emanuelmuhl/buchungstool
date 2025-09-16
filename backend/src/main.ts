import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS für Frontend
  app.enableCors({
    origin: [
      'http://localhost:3102', 
      'http://localhost:3100', 
      'http://localhost:3000',
      // Für Proxmox VM Deployment
      'http://192.168.1.156',
      // Für andere lokale IPs
      /^http:\/\/192\.168\.\d+\.\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3101;
  await app.listen(port);
  console.log(`🚀 Backend läuft auf Port ${port}`);
  console.log(`🌐 Frontend wird auf Port 3102 erwartet`);
}
bootstrap(); 
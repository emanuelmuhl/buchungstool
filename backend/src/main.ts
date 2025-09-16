import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS für Frontend
  app.enableCors({
    origin: ['http://localhost:3102', 'http://localhost:3100', 'http://localhost:3000'],
    credentials: true,
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
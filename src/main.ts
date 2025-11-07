import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database/ormconfig';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(8080);
  console.log('Server running on http://localhost:8080');
}
bootstrap();

async function testDB() {
  await AppDataSource.initialize()
    .then(() => console.log('Database connected!'))
    .catch(err => console.error('DB connection error:', err));
}
testDB();

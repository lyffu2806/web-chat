process.env.TZ = 'UTC';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // ← thêm generic
  app.enableCors({ origin: 'http://localhost:4200' });
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}
bootstrap();

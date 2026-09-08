import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
  });
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  // Serve static frontend files (JS, CSS, assets)
  const express = require('express');
  app.use(express.static(join(process.cwd(), 'frontend', 'dist')));

  // SPA fallback: serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(process.cwd(), 'frontend', 'dist', 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

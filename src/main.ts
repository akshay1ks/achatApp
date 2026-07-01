import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
 
async function bootstrap() {
  // --- startup env check (helps diagnose Railway/DB config issues) ---
  console.log('DATABASE_URL present?', process.env.DATABASE_URL);
  // TEMP DIAGNOSTIC: show which DB/Supabase-related keys actually exist in this
  // container (values hidden). Remove once the deploy works.
  console.log(
    'env keys seen:',
    JSON.stringify(
      Object.keys(process.env).filter((k) =>
        /DATA|SUPA|PG|POSTGRES/i.test(k),
      ),
    ),
  );
  if (!process.env.DATABASE_URL) {
    console.error(
      'FATAL: DATABASE_URL is not set. The app will fail to connect to Postgres. ' +
        'Set it in Railway -> service -> Variables (use the Supabase Session pooler URI).',
    );
    process.exit(1); 
  }
  const { AppModule } = await import('./app.module');

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on port ${port}`);
}
bootstrap();
import { NestFactory } from '@nestjs/core';

import { SeedModule } from '@/modules/database/seeds/seed.module';
import { SeedService } from '@/modules/database/seeds/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    await app.get(SeedService).run();
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

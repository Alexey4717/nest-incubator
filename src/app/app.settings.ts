import { setupValidationPipe } from '@/setup/pipes.setup';
import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { swaggerSetup } from './setup/swagger.setup';

/** Подключает class-validator к Nest DI; вызывать после app.init(). */
export function setupClassValidatorContainer(app: INestApplication): void {
  const moduleRef = app.get(ModuleRef);
  useContainer(
    {
      get<T>(type: new (...args: unknown[]) => T): T {
        const instance = moduleRef.get(type, { strict: false });
        return instance ?? new type();
      },
    },
    { fallback: true, fallbackOnErrors: true },
  );
}

function applyHttpSettings(app: INestApplication): void {
  const server = app.getHttpAdapter().getInstance();
  if (server && typeof server.set === 'function') {
    server.set('trust proxy', 1);
  }

  app.use(cookieParser());

  app.enableCors();

  setupValidationPipe(app);

  swaggerSetup(app);
}

/** Глобальная настройка приложения (HTTP + init + class-validator); вызывается из main и e2e. */
export async function configApp(app: INestApplication): Promise<void> {
  applyHttpSettings(app);
  await app.init();
  setupClassValidatorContainer(app);
}

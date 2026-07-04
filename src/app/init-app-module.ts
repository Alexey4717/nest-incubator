import { DynamicModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { CoreConfig } from '@/shared/core/core.config';

import { AppModule } from './app.module';

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return AppModule.forRoot(coreConfig);
}

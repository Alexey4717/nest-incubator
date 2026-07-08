import { DynamicModule, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { CoreConfig } from '@/shared/core/core.config';
import { CoreModule } from '@/shared/core/core.module';

import { configModule } from '../dynamic-config-module';
import { AppModule } from './app.module';

@Module({
  imports: [configModule, CoreModule],
})
class ConfigBootstrapModule {}

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(ConfigBootstrapModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return AppModule.forRoot(coreConfig);
}

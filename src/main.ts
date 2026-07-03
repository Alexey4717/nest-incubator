import { NestFactory } from '@nestjs/core';
import { createWriteStream } from 'fs';
import { get } from 'http';

import './register-paths';

import { CoreConfig } from '@/shared/core/core.config';

import { AppModule } from '@/app/app.module';
import { appSettings } from '@/app/app.settings';

async function downloadSwaggerStaticIfDev(coreConfig: CoreConfig, port: number) {
  if (!coreConfig.isDevelopment) return;

  const serverUrl = `http://127.0.0.1:${port}`;

  get(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
  });

  get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
  });

  get(`${serverUrl}/swagger/swagger-ui-standalone-preset.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-standalone-preset.js'));
  });

  get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
  });
}

async function bootstrap() {
  const startInit = +new Date();
  const app = await NestFactory.create(AppModule);
  appSettings(app);

  const coreConfig = app.get(CoreConfig);
  const port = coreConfig.PORT;
  const finishInit = (+new Date() - startInit) / 1000;

  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port.`);
    console.log(`Time to init: ${finishInit} seconds`);
  });

  await downloadSwaggerStaticIfDev(coreConfig, port);
}

bootstrap();

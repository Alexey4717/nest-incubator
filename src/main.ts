import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { AppModule } from './app.module';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from './exception-filters/http.exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const serverUrl = 'http://localhost:4000';

async function bootstrap() {
  const startInit = +new Date();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // делать трансформацию по типам, например param id из строки в number
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        throw new BadRequestException(
          errors.map((error) => {
            const constraintsKeys = Object.keys(error.constraints);
            return {
              message: error.constraints[constraintsKeys[0]],
              field: error.property,
            };
          }),
        );
      },
    }),
  );
  const port = 4000;
  const finishInit = (+new Date() - startInit) / 1000;
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('nestjs app example')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('nestjs it-incubator app')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port.`);
    console.log(`Time to init: ${finishInit} seconds`);
  });

  // get the swagger json file (if app is running in development mode)
  if (process.env.NODE_ENV === 'development') {
    // write swagger ui files
    get(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
    });

    get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
    });

    get(
      `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
      function (response) {
        response.pipe(
          createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
        );
      },
    );

    get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
    });
  }
}

bootstrap();

import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from './exception-filters/http.exception-filter';

/** Глобальная настройка HTTP-приложения (pipes, фильтры, Swagger, CORS); вызывается из main и e2e. */
export function appSettings(app: INestApplication): void {
  const server = app.getHttpAdapter().getInstance();
  if (server && typeof server.set === 'function') {
    server.set('trust proxy', 1);
  }

  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const message = errors.map((error) => {
          const constraintsKeys = Object.keys(error.constraints ?? {});
          return {
            message: error.constraints?.[constraintsKeys[0]],
            field: error.property,
          };
        });
        throw new BadRequestException({ message, error: 'Bad Request' });
      },
    }),
  );

  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('nestjs app example')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('nestjs it-incubator app')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);
}

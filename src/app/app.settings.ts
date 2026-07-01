import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '@/shared/exception-filters/http.exception-filter';

import { AppModule } from './app.module';

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
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const formatErrors = (
          validationErrors: typeof errors,
        ): { message: string; field: string }[] =>
          validationErrors.flatMap((error) => {
            const constraintsKeys = Object.keys(error.constraints ?? {});
            const current =
              constraintsKeys.length > 0
                ? [
                    {
                      message: String(error.constraints?.[constraintsKeys[0]]),
                      field: error.property,
                    },
                  ]
                : [];

            return [...current, ...formatErrors(error.children ?? [])];
          });

        throw new BadRequestException(formatErrors(errors));
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

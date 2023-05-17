import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from './exception-filters/http.exception-filter';

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
  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port.`);
    console.log(`Time to init: ${finishInit} seconds`);
  });
}

bootstrap();

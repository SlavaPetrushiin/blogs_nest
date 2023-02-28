import { HttpExceptionFilter } from './http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

const optionsValidationPipe = {
  stopAtFirstError: true,
  transform: true,
  exceptionFactory: (errors) => {
    const objectErrors = [];

    errors.forEach((error) => {
      for (const key in error.constraints) {
        objectErrors.push({
          field: error.property,
          message: error.constraints[key],
        });
      }
    });

    throw new BadRequestException(objectErrors);
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(optionsValidationPipe));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();

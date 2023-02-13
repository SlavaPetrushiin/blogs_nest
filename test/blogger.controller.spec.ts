import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
// import cookieParser = require('cookie-parser');
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { AppModule } from '../src/app.module';

jest.setTimeout(15000);
describe('AppController', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        exceptionFactory: (errors) => {
          const customErrors = [];
          errors.forEach((e) => {
            const keys = Object.keys(e.constraints);
            keys.forEach((k) => {
              customErrors.push({
                message: e.constraints[k],
                field: e.property,
              });
            });
          });
          throw new BadRequestException(customErrors);
        },
      }),
    );
    // app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    app.close();
  });

  describe('blogger-controller', () => {
    it('should delete all data', async () => {
      const blog = await request(server).post('/blogs').send({
        name: 'React',
        description: 'React supe',
        websiteUrl: 'sssss',
      });
      expect(blog.body).toStrictEqual(1);
    });
  });
});

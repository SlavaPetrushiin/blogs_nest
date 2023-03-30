import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.UNAUTHORIZED) {
      const errorResponse = {
        errorsMessages: [
          {
            field: 'UNAUTHORIZED',
            message: 'UNAUTHORIZED',
          },
        ],
      };

      return response.status(status).json(errorResponse);
    }

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse = {
        errorsMessages: [],
      };

      const responseException: any = exception.getResponse();
      const messages = responseException.message;
      messages.forEach((m) => errorResponse.errorsMessages.push(m));

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

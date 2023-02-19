import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const credentials = { secretName: 'admin', secretPassword: 'qwerty' };

@Injectable()
export class AuthBasicGuard {
  async canActivate(context) {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const headerAuth = request.headers.authorization;
    const typeAuth = headerAuth.split(' ')[0] || '';
    const params = headerAuth.split(' ')[1] || '';

    const [name, password] = Buffer.from(params, 'base64')
      .toString()
      .split(':');

    if (
      typeAuth != 'Basic' ||
      name != credentials.secretName ||
      password != credentials.secretPassword
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

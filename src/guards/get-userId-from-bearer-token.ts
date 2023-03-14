import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

function objectUser(id: null | string, login: null | string) {
  return { id, login };
}

@Injectable()
export class GetUserIdFromBearerToken implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      request.user = objectUser(null, null);
      return true;
    }

    const authType = auth.split(' ')[0];
    if (authType !== 'Bearer') {
      request.user = objectUser(null, null);
      return true;
    }

    const accessToken = auth.split(' ')[1];
    if (!accessToken) {
      request.user = objectUser(null, null);
      return true;
    }

    const payload = this.jwtService.verify(accessToken, { secret: this.configService.get('JWT_ACCESS_SECRET') });
    if (!payload) {
      request.user = objectUser(null, null);
      return true;
    }

    request.user = objectUser(payload.id, payload.login);
    return true;
  }
}

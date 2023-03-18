import { UsersRepository } from './../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  deviceId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class RefreshTokenCustomGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) throw new UnauthorizedException();

      const jwtPayload = (await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)) as JwtPayload;
      if (!jwtPayload) throw new UnauthorizedException();

      const user = await this.usersRepository.findUserById(jwtPayload.id);
      if (!user) throw new UnauthorizedException();
      request.user = jwtPayload;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}

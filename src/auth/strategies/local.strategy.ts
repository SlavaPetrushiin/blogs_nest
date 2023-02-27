import { AuthService } from './../auth.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(emailOrLogin: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(emailOrLogin, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RecoveryPasswordDto } from './dto/recoveryPass.dto';
import { ConfirmationResendingDto } from './dto/confirmation-resending.dto copy';
import { ConfirmationDto } from './dto/confirmation.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { getArrayErrors } from './../utils/getArrayErrors';
import { UsersService } from './../users/users.service';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { Controller, Get, Post, Body, HttpCode, BadRequestException, HttpStatus, UseGuards, Request, UnauthorizedException, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

const MILLISECONDS_IN_HOUR = 3_600_000;
const MAX_AGE_COOKIE_MILLISECONDS = 20; //* MILLISECONDS_IN_HOUR; //MILLISECONDS_IN_HOUR * 20 //20_000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.findUserById(req.user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async register(@Body() registrationDto: RegistrationDto) {
    return this.usersService.createUser(registrationDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res() res) {
    const title = req.headers['user-agent'] || '';
    const tokens = await this.authService.login(req.user, req.ip, title);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: MAX_AGE_COOKIE_MILLISECONDS,
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: tokens.accessToken });
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Request() req) {
    const userId = req.user.id;
    const deviceId = req.user.deviceId;
    const isDeleted = await this.authService.logout(userId, deviceId);

    if (!isDeleted) throw new UnauthorizedException();
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmationEmail(@Body() confirmationDto: ConfirmationDto, @Res() response: Response) {
    const result = await this.authService.confirmCode(confirmationDto.code);
    if (!result) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }
    response.status(HttpStatus.NO_CONTENT).send();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async confirmationEmailResending(@Body() { email }: ConfirmationResendingDto, @Res() response: Response) {
    const result = await this.authService.confirmResending(email);
    if (!result) {
      throw new BadRequestException(getArrayErrors('code', 'Не удалось обовить код'));
    }
    response.status(HttpStatus.NO_CONTENT).send();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() { email }: ConfirmationResendingDto, @Res() response: Response) {
    const result = await this.authService.passwordRecovery(email);
    if (!result) {
      throw new BadRequestException(getArrayErrors('code', 'Не удалось создать код на обновление пароля'));
    }

    response.status(HttpStatus.NO_CONTENT).send();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async updatePassword(@Body() recoveryPasswordDto: RecoveryPasswordDto, @Res() response: Response) {
    const { newPassword, recoveryCode } = recoveryPasswordDto;
    const result = await this.authService.updatePassword(newPassword, recoveryCode);
    if (!result) {
      throw new BadRequestException(getArrayErrors('code', 'Не удалось создать код на обновление пароля'));
    }

    response.status(HttpStatus.NO_CONTENT).send();
  }

  @HttpCode(HttpStatus.UNAUTHORIZED)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req, @Res() res) {
    const user = req.user;
    const tokens = await this.authService.updateRefreshToken(user);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: MAX_AGE_COOKIE_MILLISECONDS,
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: tokens.accessToken });
  }
}

import { AccessTokenGuard } from './../auth/guards/accessToken.guard';
import { AuthService } from './../auth/auth.service';
import { AuthBasicGuard } from '../auth/guards/auth_basic.guard';
import {
  Controller,
  Get,
  Request,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Body, UseGuards } from '@nestjs/common/decorators';

@Controller('security')
export class SecurityController {
  constructor(private authService: AuthService) {}

  @UseGuards(AccessTokenGuard)
  @Get('devices')
  async getDevices(@Request() req) {
    return this.authService.findAllSessions(req.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('devices')
  async deleteDevices(@Request() req) {
    this.authService.removeAllSessionsUserNotCurrent(
      req.user.id,
      req.user.deviceId,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  @Delete('devices/:deviceId')
  async deleteCurrentDevice(@Request() req) {
    this.authService.removeCurrentDevice(req.user.id, req.user.deviceId);
  }
}

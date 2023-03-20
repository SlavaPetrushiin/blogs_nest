import { SkipThrottle } from '@nestjs/throttler';
import { RefreshTokenCustomGuard } from './../guards/refresh-token.guard';
import { AuthService } from './../auth/auth.service';

import { Controller, Get, Request, Delete, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { Param, UseGuards } from '@nestjs/common/decorators';
@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(private authService: AuthService) { }

  @UseGuards(RefreshTokenCustomGuard)
  @Get('devices')
  async getDevices(@Request() req) {
    const userId = req.user.id;
    return this.authService.findAllSessions(userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenCustomGuard)
  @Delete('devices')
  async deleteDevices(@Request() req) {
    this.authService.removeAllSessionsUserNotCurrent(req.user.id, req.user.deviceId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenCustomGuard)
  @Delete('devices/:deviceId')
  async deleteCurrentDevice(@Param('deviceId') deviceId: string, @Request() req) {
    const isDeleted = await this.authService.removeCurrentDevice(req.user.id, deviceId);
    if (!isDeleted) {
      throw new NotFoundException();
    }
    return;
  }
}

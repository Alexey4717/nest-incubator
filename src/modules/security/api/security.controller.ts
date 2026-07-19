import { Controller, Delete, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { CurrentDeviceId } from '@/core/decorators/param/currentDeviceId.decorator';
import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';

import { RefreshJwtAuthGuard } from '@/modules/auth/guards/refresh-jwt-auth.guard';

import { TerminateDeviceCommand } from '../application/commands/terminate-device.command';
import { TerminateOtherDevicesCommand } from '../application/commands/terminate-other-devices.command';
import { GetDevicesQuery } from '../application/queries/get-devices.query';
import {
  ApiGetDevices,
  ApiTerminateDevice,
  ApiTerminateOtherDevices,
} from './security.swagger.decorators';

@SkipThrottle()
@ApiTags('Security')
@ApiCookieAuth('refreshToken')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(RefreshJwtAuthGuard)
  @Get('devices')
  @HttpCode(200)
  @ApiGetDevices()
  getDevices(@CurrentUserId() userId: string) {
    return this.queryBus.execute(new GetDevicesQuery(userId));
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete('devices')
  @HttpCode(204)
  @ApiTerminateOtherDevices()
  terminateOtherDevices(@CurrentUserId() userId: string, @CurrentDeviceId() deviceId: string) {
    return this.commandBus.execute(new TerminateOtherDevicesCommand({ userId, deviceId }));
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete('devices/:deviceId')
  @HttpCode(204)
  @ApiTerminateDevice()
  terminateDevice(@CurrentUserId() userId: string, @Param('deviceId') deviceId: string) {
    return this.commandBus.execute(new TerminateDeviceCommand({ userId, deviceId }));
  }
}

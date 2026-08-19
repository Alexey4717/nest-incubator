import { Controller, Delete, HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';

import { DeleteAllDataCommand } from '../application/commands/delete-all-data.command';
import { ApiDeleteAllData } from './testing.swagger.decorators';

@SkipThrottle()
@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('all-data')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiDeleteAllData()
  async deleteAllData() {
    notificationToDomainException(await this.commandBus.execute(new DeleteAllDataCommand()));
  }
}

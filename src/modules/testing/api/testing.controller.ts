import { Controller, Delete, HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { DeleteAllDataCommand } from '../application/commands/delete-all-data.command';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('all-data')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteAllData() {
    return await this.commandBus.execute(new DeleteAllDataCommand());
  }
}

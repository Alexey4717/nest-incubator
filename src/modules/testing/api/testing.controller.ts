import { Controller, Delete, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';
import { TestingRepository } from '../infrastructure/testing.repository';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private testingRepository: TestingRepository) {}

  @Delete('all-data')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteAllData() {
    return await this.testingRepository.deleteAllData();
  }
}

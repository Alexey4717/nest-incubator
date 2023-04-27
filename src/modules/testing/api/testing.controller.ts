import { Controller, Delete, HttpCode } from '@nestjs/common';
import { constants } from 'http2';
import { TestingRepository } from '../infrastructure/testing.repository';

@Controller('testing')
export class TestingController {
  constructor(private testingRepository: TestingRepository) {}

  @Delete('all-data')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteAllData() {
    const isAllDataDeleted = await this.testingRepository.deleteAllData();
    // if (!resData) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }
    return isAllDataDeleted;
  }
}

import { INestApplication } from '@nestjs/common';
import { constants } from 'http2';
import request from 'supertest';

export async function clearAllData(app: INestApplication): Promise<void> {
  await request(app.getHttpServer())
    .delete('/testing/all-data')
    .expect(constants.HTTP_STATUS_NO_CONTENT);
}

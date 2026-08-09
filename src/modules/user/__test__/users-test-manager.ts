import { INestApplication } from '@nestjs/common';
import { constants } from 'http2';
import request, { Test } from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from '@/__test__/utils/basic-auth.helper';

import { createSaUser, SaUserInput } from '@/modules/auth/__test__/auth.helper';
import { UserViewModel } from '@/modules/user/types/view-models';

export class UsersTestManager {
  constructor(private readonly app: INestApplication) {}

  createSaUser(input: SaUserInput): Promise<UserViewModel> {
    return createSaUser(this.app, input);
  }

  getUsers(query = ''): Test {
    const path = query ? `/sa/users?${query}` : '/sa/users';

    return request(this.app.getHttpServer())
      .get(path)
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER);
  }

  createUser(input: SaUserInput): Test {
    return request(this.app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send(input);
  }

  deleteUser(id: string): Test {
    return request(this.app.getHttpServer())
      .delete(`/sa/users/${id}`)
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER);
  }

  async expectUserCount(expectedCount: number): Promise<request.Response> {
    return this.getUsers()
      .expect(constants.HTTP_STATUS_OK)
      .then((res) => {
        expect(res.body.items).toHaveLength(expectedCount);
        expect(res.body.totalCount).toBe(expectedCount);
        return res;
      });
  }
}

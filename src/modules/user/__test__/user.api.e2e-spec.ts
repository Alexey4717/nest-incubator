import { constants } from 'http2';
import request from 'supertest';

import {
  expectPaginatorItemsCount,
  expectPaginatorShape,
} from '@/__test__/assertions/response.helpers';
import { invalidInputData } from '@/__test__/fixtures/invalid-input-data';
import { E2eContext, initSettings } from '@/__test__/setup/init-settings';
import { ADMIN_BASIC_AUTH_HEADER } from '@/__test__/utils/basic-auth.helper';
import { clearAllData } from '@/__test__/utils/db.helper';

describe('User API (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
  });

  // testing get '/sa/users' api
  describe('GET /sa/users', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer).get('/sa/users').expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return paginated users — 200', async () => {
      await ctx.users.createSaUser({
        login: 'user1',
        email: 'user1@test.dev',
        password: 'qwerty12',
      });
      await ctx.users.createSaUser({
        login: 'user2',
        email: 'user2@test.dev',
        password: 'qwerty12',
      });

      const res = await ctx.users.getUsers().expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 2);
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 3; i++) {
        await ctx.users.createSaUser({
          login: `paguser${i}`,
          email: `paguser${i}@test.dev`,
          password: 'qwerty12',
        });
      }

      const res = await ctx.users
        .getUsers('pageSize=2&pageNumber=2')
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorShape(res.body);
      expect(res.body.page).toBe(2);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.totalCount).toBe(3);
    });

    it('should support sort by login asc', async () => {
      await ctx.users.createSaUser({
        login: 'zebra',
        email: 'zebra@test.dev',
        password: 'qwerty12',
      });
      await ctx.users.createSaUser({
        login: 'alpha',
        email: 'alpha@test.dev',
        password: 'qwerty12',
      });

      const res = await ctx.users
        .getUsers('sortBy=login&sortDirection=asc')
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.items[0].login).toBe('alpha');
      expect(res.body.items[1].login).toBe('zebra');
    });

    it('should support search by login term', async () => {
      await ctx.users.createSaUser({
        login: 'findme',
        email: 'findme@test.dev',
        password: 'qwerty12',
      });
      await ctx.users.createSaUser({
        login: 'other',
        email: 'other@test.dev',
        password: 'qwerty12',
      });

      const res = await ctx.users.getUsers('searchLoginTerm=find').expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
      expect(res.body.items[0].login).toBe('findme');
    });

    it('should support search by email term', async () => {
      await ctx.users.createSaUser({
        login: 'emailuser',
        email: 'unique@test.dev',
        password: 'qwerty12',
      });
      await ctx.users.createSaUser({
        login: 'other2',
        email: 'other2@test.dev',
        password: 'qwerty12',
      });

      const res = await ctx.users
        .getUsers('searchEmailTerm=unique')
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
      expect(res.body.items[0].email).toBe('unique@test.dev');
    });

    it.each([
      { query: 'pageNumber=0', field: 'pageNumber' },
      { query: 'pageSize=101', field: 'pageSize' },
      { query: 'sortDirection=invalid', field: 'sortDirection' },
      { query: 'sortBy=invalidField', field: 'sortBy' },
    ])('should return 400 for invalid query — $query', async ({ query, field }) => {
      const res = await ctx.users.getUsers(query).expect(constants.HTTP_STATUS_BAD_REQUEST);

      const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
      expect(fields).toContain(field);
    });
  });

  // testing post '/sa/users' api
  describe('POST /sa/users', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .post('/sa/users')
        .send({
          login: 'nouser',
          password: 'qwerty12',
          email: 'nouser@test.dev',
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should create user — 201', async () => {
      const res = await ctx.users
        .createUser({
          login: 'newuser',
          password: 'qwerty12',
          email: 'newuser@test.dev',
        })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        login: 'newuser',
        email: 'newuser@test.dev',
        createdAt: expect.any(String),
      });
    });

    it.each(invalidInputData.user)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
          .post('/sa/users')
          .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing delete '/sa/users/:id' api
  describe('DELETE /sa/users/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .delete('/sa/users/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should delete user — 204', async () => {
      const user = await ctx.users.createSaUser({
        login: 'deluser',
        email: 'deluser@test.dev',
        password: 'qwerty12',
      });

      await ctx.users.deleteUser(user.id).expect(constants.HTTP_STATUS_NO_CONTENT);

      const list = await ctx.users.getUsers().expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(list.body, 0);
    });

    it('should return 404 for non-existent user', async () => {
      await ctx.users
        .deleteUser('00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });
});

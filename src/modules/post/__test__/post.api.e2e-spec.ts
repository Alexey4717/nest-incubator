import { constants } from 'http2';
import request from 'supertest';

import {
  expectPaginatorItemsCount,
  expectPaginatorShape,
} from '@/__test__/assertions/response.helpers';
import { invalidInputData, validInputData } from '@/__test__/fixtures/invalid-input-data';
import { E2eContext, initSettings } from '@/__test__/setup/init-settings';
import { ADMIN_BASIC_AUTH_HEADER } from '@/__test__/utils/basic-auth.helper';
import { clearAllData } from '@/__test__/utils/db.helper';

export { invalidInputData };

describe('Post API (e2e)', () => {
  let ctx: E2eContext;
  let blogId: string;
  let accessToken: string;
  const userLogin = 'postuser';
  const userPassword = 'qwerty12';

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);

    const blogRes = await request(ctx.httpServer)
      .post('/sa/blogs')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send(validInputData.blog)
      .expect(constants.HTTP_STATUS_CREATED);

    blogId = blogRes.body.id;

    await ctx.users.createSaUser({
      login: userLogin,
      email: 'postuser@test.dev',
      password: userPassword,
    });

    accessToken = await ctx.auth.loginAndGetToken(userLogin, userPassword);
  });

  async function createPostViaSa(overrides: Record<string, unknown> = {}) {
    const res = await request(ctx.httpServer)
      .post('/posts')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ ...validInputData.post, blogId, ...overrides })
      .expect(constants.HTTP_STATUS_CREATED);

    return res.body;
  }

  // testing get '/posts' api
  describe('GET /posts', () => {
    it('should return paginated posts — 200', async () => {
      await createPostViaSa({ title: 'Post 1' });
      await createPostViaSa({ title: 'Post 2' });

      const res = await request(ctx.httpServer).get('/posts').expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 2);
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 3; i++) {
        await createPostViaSa({ title: `PagPost ${i}` });
      }

      const res = await request(ctx.httpServer)
        .get('/posts?pageSize=2&pageNumber=2')
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorShape(res.body);
      expect(res.body.page).toBe(2);
      expect(res.body.items).toHaveLength(1);
    });

    it.each([
      { query: 'pageNumber=0', field: 'pageNumber' },
      { query: 'pageSize=101', field: 'pageSize' },
      { query: 'sortDirection=invalid', field: 'sortDirection' },
      { query: 'sortBy=invalidField', field: 'sortBy' },
    ])('should return 400 for invalid query — $query', async ({ query, field }) => {
      const res = await request(ctx.httpServer)
        .get(`/posts?${query}`)
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
      expect(fields).toContain(field);
    });
  });

  // testing get '/posts/:id' api
  describe('GET /posts/:id', () => {
    it('should return post by id — 200', async () => {
      const post = await createPostViaSa();

      const res = await request(ctx.httpServer)
        .get(`/posts/${post.id}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.id).toBe(post.id);
      expect(res.body.extendedLikesInfo).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      await request(ctx.httpServer)
        .get('/posts/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing post '/posts' api
  describe('POST /posts', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .post('/posts')
        .send({ ...validInputData.post, blogId })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should create post — 201', async () => {
      const res = await request(ctx.httpServer)
        .post('/posts')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ ...validInputData.post, blogId })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        title: validInputData.post.title,
        shortDescription: validInputData.post.shortDescription,
        content: validInputData.post.content,
        blogId,
        blogName: validInputData.blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      });
    });

    it.each(
      invalidInputData.post.map((item) => ({
        ...item,
        payload: item.expectedFields.includes('blogId')
          ? item.payload
          : { ...item.payload, blogId },
      })),
    )('should return 400 for invalid input — $description', async ({ payload, expectedFields }) => {
      const res = await request(ctx.httpServer)
        .post('/posts')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send(payload)
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
      expectedFields.forEach((field) => expect(fields).toContain(field));
    });

    it('should return 404 for non-existent blogId', async () => {
      await request(ctx.httpServer)
        .post('/posts')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          ...validInputData.post,
          blogId: '00000000-0000-0000-0000-000000000001',
        })
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing put '/posts/:id' api
  describe('PUT /posts/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .put('/posts/00000000-0000-0000-0000-000000000001')
        .send({ ...validInputData.post, blogId })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update post — 204', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .put(`/posts/${post.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          title: 'Updated title',
          shortDescription: 'Updated short',
          content: 'Updated content',
          blogId,
        })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.httpServer)
        .get(`/posts/${post.id}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.title).toBe('Updated title');
    });
  });

  // testing delete '/posts/:id' api
  describe('DELETE /posts/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .delete('/posts/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should delete post — 204', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .delete(`/posts/${post.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await request(ctx.httpServer)
        .get(`/posts/${post.id}`)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing get '/posts/:postId/comments' api
  describe('GET /posts/:postId/comments', () => {
    it('should return paginated comments — 200', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validInputData.comment)
        .expect(constants.HTTP_STATUS_CREATED);

      const res = await request(ctx.httpServer)
        .get(`/posts/${post.id}/comments`)
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
    });

    it('should return 404 for non-existent post', async () => {
      await request(ctx.httpServer)
        .get('/posts/00000000-0000-0000-0000-000000000001/comments')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing post '/posts/:postId/comments' api
  describe('POST /posts/:postId/comments', () => {
    it('should return 401 if not auth', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .post(`/posts/${post.id}/comments`)
        .send(validInputData.comment)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should create comment — 201', async () => {
      const post = await createPostViaSa();

      const res = await request(ctx.httpServer)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validInputData.comment)
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        content: validInputData.comment.content,
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: userLogin,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it.each(invalidInputData.comment)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const post = await createPostViaSa();

        const res = await request(ctx.httpServer)
          .post(`/posts/${post.id}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing put '/posts/:postId/like-status' api
  describe('PUT /posts/:postId/like-status', () => {
    it('should return 401 if not auth', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .put(`/posts/${post.id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update like status — 204', async () => {
      const post = await createPostViaSa();

      await request(ctx.httpServer)
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.httpServer)
        .get(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.extendedLikesInfo.myStatus).toBe('Like');
      expect(res.body.extendedLikesInfo.likesCount).toBe(1);
    });
  });
});

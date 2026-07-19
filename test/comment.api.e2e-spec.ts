import { constants } from 'http2';
import request from 'supertest';

import { createSaUser, loginAndGetToken } from './utils/auth.helper';
import { ADMIN_BASIC_AUTH_HEADER } from './utils/basic-auth.helper';
import { clearAllData } from './utils/db.helper';
import { createE2eApplication, E2eContext } from './utils/e2e-application';
import { invalidInputData, validInputData } from './utils/invalid-input-data';

describe('Comment API (e2e)', () => {
  let ctx: E2eContext;

  let ownerToken: string;
  let otherToken: string;
  let postId: string;
  let ownerCommentId: string;
  let otherCommentId: string;

  const ownerLogin = 'cmntowner';
  const otherLogin = 'cmntother';
  const password = 'qwerty12';

  beforeAll(async () => {
    ctx = await createE2eApplication();
    await clearAllData(ctx.app);

    const blogRes = await request(ctx.app.getHttpServer())
      .post('/sa/blogs')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send(validInputData.blog)
      .expect(constants.HTTP_STATUS_CREATED);

    const postRes = await request(ctx.app.getHttpServer())
      .post('/posts')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ ...validInputData.post, blogId: blogRes.body.id })
      .expect(constants.HTTP_STATUS_CREATED);

    postId = postRes.body.id;

    await createSaUser(ctx.app, {
      login: ownerLogin,
      email: 'cmntowner@test.dev',
      password,
    });
    await createSaUser(ctx.app, {
      login: otherLogin,
      email: 'cmntother@test.dev',
      password,
    });

    ownerToken = await loginAndGetToken(ctx.app, ownerLogin, password);
    otherToken = await loginAndGetToken(ctx.app, otherLogin, password);

    const ownerCommentRes = await request(ctx.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'Owner comment content here' })
      .expect(constants.HTTP_STATUS_CREATED);

    ownerCommentId = ownerCommentRes.body.id;

    const otherCommentRes = await request(ctx.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Other user comment content' })
      .expect(constants.HTTP_STATUS_CREATED);

    otherCommentId = otherCommentRes.body.id;
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  // testing get '/comments/:id' api
  describe('GET /comments/:id', () => {
    it('should return comment by id — 200', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get(`/comments/${ownerCommentId}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.id).toBe(ownerCommentId);
      expect(res.body.commentatorInfo.userLogin).toBe(ownerLogin);
    });

    it('should return 404 for non-existent comment', async () => {
      await request(ctx.app.getHttpServer())
        .get('/comments/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing put '/comments/:commentId' api
  describe('PUT /comments/:commentId', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.app.getHttpServer())
        .put(`/comments/${ownerCommentId}`)
        .send({ content: 'Updated comment content here' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update own comment — 204', async () => {
      await request(ctx.app.getHttpServer())
        .put(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'Updated owner comment content' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.app.getHttpServer())
        .get(`/comments/${ownerCommentId}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.content).toBe('Updated owner comment content');
    });

    it('should return 403 if not owner', async () => {
      await request(ctx.app.getHttpServer())
        .put(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'Trying to update others comment' })
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it.each(invalidInputData.comment)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.app.getHttpServer())
          .put(`/comments/${ownerCommentId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing delete '/comments/:commentId' api
  describe('DELETE /comments/:commentId', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.app.getHttpServer())
        .delete(`/comments/${otherCommentId}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return 403 if not owner', async () => {
      await request(ctx.app.getHttpServer())
        .delete(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete own comment — 204', async () => {
      const commentRes = await request(ctx.app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'Comment to delete content here' })
        .expect(constants.HTTP_STATUS_CREATED);

      await request(ctx.app.getHttpServer())
        .delete(`/comments/${commentRes.body.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await request(ctx.app.getHttpServer())
        .get(`/comments/${commentRes.body.id}`)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing put '/comments/:commentId/like-status' api
  describe('PUT /comments/:commentId/like-status', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.app.getHttpServer())
        .put(`/comments/${ownerCommentId}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update like status — 204', async () => {
      await request(ctx.app.getHttpServer())
        .put(`/comments/${otherCommentId}/like-status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.app.getHttpServer())
        .get(`/comments/${otherCommentId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.likesInfo.myStatus).toBe('Like');
      expect(res.body.likesInfo.likesCount).toBe(1);
    });
  });
});

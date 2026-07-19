import { constants } from 'http2';
import request from 'supertest';

import { setupCommentE2eContext } from './helpers/comment-setup.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { invalidInputData } from './helpers/invalid-input-data';

describe('Comment API (e2e)', () => {
  let ctx: E2eContext;

  let ownerToken: string;
  let otherToken: string;
  let postId: string;
  let ownerCommentId: string;
  let otherCommentId: string;
  let ownerLogin: string;

  beforeAll(async () => {
    ctx = await initSettings();

    const setup = await setupCommentE2eContext(ctx.app, ctx.users, ctx.auth);
    ownerToken = setup.ownerToken;
    otherToken = setup.otherToken;
    postId = setup.postId;
    ownerCommentId = setup.ownerCommentId;
    otherCommentId = setup.otherCommentId;
    ownerLogin = setup.ownerLogin;
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  // testing get '/comments/:id' api
  describe('GET /comments/:id', () => {
    it('should return comment by id — 200', async () => {
      const res = await request(ctx.httpServer)
        .get(`/comments/${ownerCommentId}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.id).toBe(ownerCommentId);
      expect(res.body.commentatorInfo.userLogin).toBe(ownerLogin);
    });

    it('should return 404 for non-existent comment', async () => {
      await request(ctx.httpServer)
        .get('/comments/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing put '/comments/:commentId' api
  describe('PUT /comments/:commentId', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .put(`/comments/${ownerCommentId}`)
        .send({ content: 'Updated comment content here' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update own comment — 204', async () => {
      await request(ctx.httpServer)
        .put(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'Updated owner comment content' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.httpServer)
        .get(`/comments/${ownerCommentId}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.content).toBe('Updated owner comment content');
    });

    it('should return 403 if not owner', async () => {
      await request(ctx.httpServer)
        .put(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'Trying to update others comment' })
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it.each(invalidInputData.comment)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
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
      await request(ctx.httpServer)
        .delete(`/comments/${otherCommentId}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return 403 if not owner', async () => {
      await request(ctx.httpServer)
        .delete(`/comments/${ownerCommentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete own comment — 204', async () => {
      const commentRes = await request(ctx.httpServer)
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'Comment to delete content here' })
        .expect(constants.HTTP_STATUS_CREATED);

      await request(ctx.httpServer)
        .delete(`/comments/${commentRes.body.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await request(ctx.httpServer)
        .get(`/comments/${commentRes.body.id}`)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing put '/comments/:commentId/like-status' api
  describe('PUT /comments/:commentId/like-status', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .put(`/comments/${ownerCommentId}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update like status — 204', async () => {
      await request(ctx.httpServer)
        .put(`/comments/${otherCommentId}/like-status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ likeStatus: 'Like' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.httpServer)
        .get(`/comments/${otherCommentId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.likesInfo.myStatus).toBe('Like');
      expect(res.body.likesInfo.likesCount).toBe(1);
    });
  });
});

import { constants } from 'http2';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './helpers/basic-auth.helper';
import { runParallelRequests } from './helpers/concurrency.helper';
import { clearAllData } from './helpers/db.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { validInputData } from './helpers/invalid-input-data';

describe('Likes concurrency (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  async function createPost() {
    const blogRes = await request(ctx.httpServer)
      .post('/sa/blogs')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send(validInputData.blog)
      .expect(constants.HTTP_STATUS_CREATED);

    const postRes = await request(ctx.httpServer)
      .post('/posts')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ ...validInputData.post, blogId: blogRes.body.id })
      .expect(constants.HTTP_STATUS_CREATED);

    return postRes.body.id as string;
  }

  async function createComment(postId: string, token: string) {
    const res = await request(ctx.httpServer)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Comment for concurrency test' })
      .expect(constants.HTTP_STATUS_CREATED);

    return res.body.id as string;
  }

  async function createUsersWithTokens(count: number, prefix: string) {
    const password = 'qwerty12';
    const tokens: string[] = [];

    for (let index = 0; index < count; index++) {
      const login = `${prefix}${index}`;
      await ctx.users.createSaUser({
        login,
        email: `${login}@test.dev`,
        password,
      });
      tokens.push(await ctx.auth.loginAndGetToken(login, password));
    }

    return tokens;
  }

  describe('PUT /posts/:postId/like-status', () => {
    beforeEach(async () => {
      await clearAllData(ctx.app);
    });

    it('parallel likes from N users → likesCount equals N', async () => {
      const USER_COUNT = 5;
      const postId = await createPost();
      const tokens = await createUsersWithTokens(USER_COUNT, 'plk');

      const results = await runParallelRequests(USER_COUNT, (index) =>
        request(ctx.httpServer)
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `Bearer ${tokens[index]}`)
          .send({ likeStatus: 'Like' }),
      );

      results.forEach((result) => {
        expect(result.status).toBe(constants.HTTP_STATUS_NO_CONTENT);
      });

      const res = await request(ctx.httpServer)
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${tokens[0]}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.extendedLikesInfo.likesCount).toBe(USER_COUNT);
      expect(res.body.extendedLikesInfo.dislikesCount).toBe(0);
    });

    it('parallel like and dislike from same user → single reaction', async () => {
      const postId = await createPost();
      const [token] = await createUsersWithTokens(1, 'ptg');

      const results = await Promise.all([
        request(ctx.httpServer)
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ likeStatus: 'Like' }),
        request(ctx.httpServer)
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ likeStatus: 'Dislike' }),
      ]);

      results.forEach((result) => {
        expect(result.status).toBe(constants.HTTP_STATUS_NO_CONTENT);
      });

      const res = await request(ctx.httpServer)
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(constants.HTTP_STATUS_OK);

      const { myStatus, likesCount, dislikesCount } = res.body.extendedLikesInfo;
      expect(['Like', 'Dislike']).toContain(myStatus);
      expect(likesCount + dislikesCount).toBe(1);
    });
  });

  describe('PUT /comments/:commentId/like-status', () => {
    beforeEach(async () => {
      await clearAllData(ctx.app);
    });

    it('parallel likes from N users → likesCount equals N', async () => {
      const USER_COUNT = 4;
      const [authorToken] = await createUsersWithTokens(1, 'cau');
      const postId = await createPost();
      const commentId = await createComment(postId, authorToken);
      const tokens = await createUsersWithTokens(USER_COUNT, 'clk');

      const results = await runParallelRequests(USER_COUNT, (index) =>
        request(ctx.httpServer)
          .put(`/comments/${commentId}/like-status`)
          .set('Authorization', `Bearer ${tokens[index]}`)
          .send({ likeStatus: 'Like' }),
      );

      results.forEach((result) => {
        expect(result.status).toBe(constants.HTTP_STATUS_NO_CONTENT);
      });

      const res = await request(ctx.httpServer)
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.likesInfo.likesCount).toBe(USER_COUNT);
      expect(res.body.likesInfo.dislikesCount).toBe(0);
    });

    it('parallel like and dislike from same user → single reaction', async () => {
      const [authorToken] = await createUsersWithTokens(1, 'cau');
      const postId = await createPost();
      const commentId = await createComment(postId, authorToken);
      const [token] = await createUsersWithTokens(1, 'ctg');

      const results = await Promise.all([
        request(ctx.httpServer)
          .put(`/comments/${commentId}/like-status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ likeStatus: 'Like' }),
        request(ctx.httpServer)
          .put(`/comments/${commentId}/like-status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ likeStatus: 'Dislike' }),
      ]);

      results.forEach((result) => {
        expect(result.status).toBe(constants.HTTP_STATUS_NO_CONTENT);
      });

      const res = await request(ctx.httpServer)
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(constants.HTTP_STATUS_OK);

      const { myStatus, likesCount, dislikesCount } = res.body.likesInfo;
      expect(['Like', 'Dislike']).toContain(myStatus);
      expect(likesCount + dislikesCount).toBe(1);
    });
  });
});
